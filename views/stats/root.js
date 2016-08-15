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
        }
    },
    methods: {
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
            db.ref("users/" + user.uid + "/questions").limitToLast(Number(this.number)).once('value', function(snapshot) {
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
                for (var i = subjects.length - 1; i >= 0; i--) {
                    if (self.questions.filter(function(obj) {
                            return obj.topic === subjects[i];
                        }).length > 0) {
                        arr[subjects[i]] = arr[subjects[i]] || []
                        arr[subjects[i]] = arr[subjects[i]].concat(self.questions.filter(function(obj) {
                            return obj.topic === subjects[i];
                        }))
                    }
                }
                lbl = []
                srs = [];
                _.forOwn(arr, function(value, key) {
                    lbl.push(key)
                    srs.push(100 * (value.length / self.questions.length))
                });
                new Chartist.Bar('#subject', {
                    series: srs,
                    labels: lbl,
                }, {
                    distributeSeries: true
                });
                lbl = []
                srs = [];
                _.forOwn(arr, function(value, key) {
                    _.remove(value, function(n) {
                        return n.correct;
                    });
                    if (value.length > 0) {
                        lbl.push(key)
                        srs.push(100 * (value.length / self.questions.length))
                    }

                });
                new Chartist.Bar('#subincorrect', {
                    series: srs,
                    labels: lbl,
                }, {
                    distributeSeries: true
                });
                self.show = true;
            });

        },
    },
});
