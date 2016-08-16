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
        }
    },
    methods: {
        runStats: function(snapshot, sub) {
            var self = this;
            qs = this.questions = _.map(_.values(snapshot.val()), function(o) {
                    if (o[sub] == "") {
                        o[sub] = "None"
                    }
                    return o;
                }) //questions array

            ql = qs.length; //total questions
            highLevel = _.countBy(qs, sub)
                c = _.compact(_.map(qs, 'correct')).length //number correct
            this.charts.correct = {
                series: [c, ql - c],
                labels: ['Correct', 'Incorrect'],
            }
            this.charts.subjects = {
                series: _.values(highLevel),
                labels: _.keys(highLevel),
            }
            this.charts.eachSubject = [];
            _.forOwn(_.countBy(_.reject(qs, 'correct'), sub), function(value, key) {
                self.charts.eachSubject.push({ title: key, labels: ["Correct", "Incorrect"], series: [highLevel[key] - value, value] })
            })
            self.charts.eachSubject = _.chunk(self.charts.eachSubject, 2);
            /* lbl = []
            }
            srs = [];
            _.forOwn(arr, function(value, key) {
                value2 = _.filter(value, function(n) {
                    return !n.correct;
                });
                if (value2.length > 0) {
                    lbl.push(key)
                    srs.push(100 * (value2.length / self.questions.length))
                }

            });
*/
            new Chartist.Pie('#subincorrect', {
                series: _.values(_.countBy(_.reject(qs, 'correct'), sub)),
                labels: _.keys(_.countBy(_.reject(qs, 'correct'), sub)),
            });
            /*
                        lbl = []
                        srs = [];
                        _.forOwn(arr, function(value, key) {
                            value2 = _.filter(value, function(n) {
                                return n.correct;
                            });
                            if (value2.length > 0) {
                                lbl.push(key)
                                srs.push(100 * (value2.length / self.questions.length))
                            }

                        });
                        new Chartist.Pie('#subcorrect', {
                            series: srs,
                            labels: lbl,
                        }, {
                            distributeSeries: true
                        });
                        badAnswers = [];
                        _.forOwn(arr, function(value, key) {
                            value2 = _.filter(value, function(n) {
                                return !n.correct;
                            });
                            if (value2.length > 0) {
                                _.forEach(value2, function(val) { badAnswers.push(val.answers) })

                            }
                            console.log(badAnswers)
                        });*/
            this.show = true;
        },
        submit: function() {
            var self = this;
            this.questions = [];
            if (this.number < 1 || this.number > 500) {
                swal({
                    title: '<h4>Number</h4>',
                    type: 'error',
                    text: 'Please enter in a different number',
                    showConfirmButton: true,
                    confirmButtonText: 'Cancel',
                    buttonsStyling: false,
                    confirmButtonClass: 'button'
                })
            }
            if (this.topic != "All") {
                db.ref("users/" + user.uid + "/questions").orderByChild("topic").equalTo(self.topic).limitToLast(Number(this.number)).once('value', function(snapshot) {
                    self.runStats(snapshot, 'subject')
                })
            } else {
                db.ref("users/" + user.uid + "/questions").limitToLast(Number(this.number)).once('value', function(snapshot) {
                    self.runStats(snapshot, 'topic')
                });
            }
        },
    },
});
