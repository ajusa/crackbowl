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
        }
    },
    methods: {
        runStats: function(snapshot, sub) {
            var self = this;
            for (var key in snapshot.val()) {
                if (!snapshot.val().hasOwnProperty(key)) continue;
                self.questions.push(snapshot.val()[key])
            }
            correct = self.questions.filter(function(obj) {
                return obj.correct
            }).length * 100 / self.questions.length;
            new Chartist.Pie('#correct', {
                series: [correct, 100 - correct],
                labels: ['Correct', 'Incorrect'],
            });
            var arr = []
            if (sub) {
                _.forOwn(self.questions, function(value, key) {
                    if (value.subject == "") {
                        value.subject = "None"
                    }
                    arr[value.subject] = arr[value.subject] || [];
                    arr[value.subject].push(value)
                });
            } else {
                _.forOwn(self.questions, function(value, key) {
                    arr[value.topic] = arr[value.topic] || [];
                    arr[value.topic].push(value)
                });
            }
            lbl = []
            srs = [];
            _.forOwn(arr, function(value, key) {
                lbl.push(key)
                srs.push(100 * (value.length / self.questions.length))
            });
            new Chartist.Pie('#subject', {
                series: srs,
                labels: lbl,
            }, {
                distributeSeries: true
            });
            lbl = []
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
            new Chartist.Pie('#subincorrect', {
                series: srs,
                labels: lbl,
            }, {
                distributeSeries: true
            });
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
                    _.forEach(value2, function(val){badAnswers.push(val.answers)})
                    
                }
                console.log(badAnswers)
            });
            self.show = true;
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
                    self.runStats(snapshot, true)
                })
            } else {
                db.ref("users/" + user.uid + "/questions").limitToLast(Number(this.number)).once('value', function(snapshot) {
                    self.runStats(snapshot, false)
                });
            }
        },
    },
});
