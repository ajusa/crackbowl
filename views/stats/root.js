Vue.component('statview', {
    template: "#statView",
    ready: function() {

    },
    data: function() {
        return {
            number: 20,
            topic: "All",
            show: false,
            questions: [],
            mostMissed: [],
            charts: {
                correct: null,
                subjects: null,
                eachSubject: null,
            },
            mode: "graphs",
            correct: "false",
        }
    },
    methods: {
        runStats: function(sub) {
            var self = this;
            qs = this.questions;

            ql = qs.length; //total questions
            highLevel = _.countBy(qs, sub)
            c = _.compact(_.map(qs, 'correct')).length //number correct
            this.charts.correct = {
                series: [c, ql - c],
                labels: ['Correct: ' + c, 'Incorrect: ' + (ql - c)],
            }
            this.charts.subjects = { series: _.values(highLevel), labels: _.keys(highLevel) }
            this.charts.eachSubject = [];
            _.forOwn(_.countBy(_.reject(qs, 'correct'), sub), function(value, key) {
                self.charts.eachSubject.push({ title: key, labels: ["Correct: " + (highLevel[key] - value), "Incorrect: " + value], series: [highLevel[key] - value, value] })
            })
            self.charts.eachSubject = _.chunk(self.charts.eachSubject, 2); //for grids
            this.show = true;
        },
        getQuestions: function(data, sub) {
            this.questions = _(data.val()).values().map(function(o) {
                o[sub] = o[sub] || "None"
                return o
            }).value()
        },
        filterQuestions: function() {
            if (this.correct != "All") {
                var val = (this.correct === "true");
                this.questions = _.filter(this.questions, ['correct', val]);
            }
        },
        submit: function() {
            var self = this;
            this.questions = [];
            if (this.number < 1 || this.number > 500) {
                swal({
                    title: '<h4>Number</h4>',
                    type: 'error',
                    text: 'Please enter in a different number that is less than 500 and greater than 0',
                    showConfirmButton: true,
                    confirmButtonText: 'Cancel',
                    buttonsStyling: false,
                    confirmButtonClass: 'button'
                })
            }
            var type = 'topic';
            if (this.topic != "All")
                type = 'subject'
            if (this.mode == "graphs") {
                if (this.topic == "All") {
                    db.ref("users/" + user.uid + "/questions").limitToLast(Number(this.number)).once('value', function(snapshot) {
                        self.getQuestions(snapshot, type)
                        self.runStats(type)
                    })
                } else {
                    db.ref("users/" + user.uid + "/questions").orderByChild("topic").equalTo(self.topic).limitToLast(Number(this.number)).once('value', function(snapshot) {
                        self.getQuestions(snapshot, type)
                        self.runStats(type)
                    })
                }
            } else {
                if (this.topic == "All") {
                    db.ref("users/" + user.uid + "/questions").limitToLast(Number(this.number)).once('value', function(snapshot) {
                        self.getQuestions(snapshot, type)
                        self.filterQuestions();
                    })
                } else {
                    db.ref("users/" + user.uid + "/questions").orderByChild("topic").equalTo(self.topic).limitToLast(Number(this.number)).once('value', function(snapshot) {
                        self.getQuestions(snapshot, type)
                        self.filterQuestions();
                    })
                }
            }
        },
    },
});
