Vue.component('statview', {
    template: "#statView",
    ready: function() {},
    data: function() {
        return {
            number: "100",
            topic: "All",
            show: false,
            questions: [],
            uid: "hmmMyxqqT6XjBChxgHZ7C0M5aKj2",
        }
    },
    methods: {
        submit: function() {
            var self = this;
            db.ref("users/" + this.uid + "/questions").limitToLast(20).on('child_added', function(snapshot) {
                console.log(snapshot.val())
                self.questions.push(snapshot.val())
            });;
            this.show = true;
        },
    },
});
