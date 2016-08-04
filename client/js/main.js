var db = firebase.database()
var vm = new Vue({
    el: '#app',
    mixins: [VueFocus.mixin],
    ready: function() {
        this.updateBuffer()
        this.startTimer();
        this.consoleBuffer.unshift({
            text: "Hit the next button (or n) to start a question, hit buzz (or space) to buzz, and hit pause/play (p) to toggle the question being read.",
            time: 1000000,
        });
        window.addEventListener('keyup', this.keys)
    },
    data: {
        questions: [],
        currentQuestion: { exists: true, },
        input: "",
        textBuffer: "Welcome to crackbowl! Please look at the console above to find out how to begin. Questions appear here",
        pause: false,
        n: 0,
        focused: false,
        consoleBuffer: [],
        canBuzz: false,
        timerBuffer: -1,
        toggle: "Pause",
        timesBuzzed: 0,
        selected: { level: "HS", subject: "History" },
        score: 0,
    },

    methods: {
        startTimer: function() {
            var self = this;
            setInterval(function() {
                if (self.timerBuffer > 0) {
                    self.timerBuffer -= 1;
                    self.pause = true;
                } else if (self.timerBuffer == 0) {
                    self.submit()
                    self.timerBuffer = -1;
                    self.timesBuzzed++;
                }
            }, 100)
        },
        updateBuffer: function() {
            var self = this;
            setInterval(function() {
                if (self.n < (self.currentQuestion.question.length) && !self.pause) {
                    self.textBuffer = self.currentQuestion.question.substring(0, self.n + 1);
                    self.n++;
                } else if (self.n == self.currentQuestion.question.length) {
                    self.timerBuffer = 30;
                    self.n++
                }
            }, 50);
        },
        toggleBuffer: function() {
            if (this.toggle == "Pause") {
                this.pause = true;
                this.toggle = "Play"
                this.canBuzz = false;
            } else {
                this.pause = false;
                this.toggle = "Pause"
                if (this.timesBuzzed < 1)
                    this.canBuzz = true;
            }
        },
        endQuestion: function() {
            this.timerBuffer = -1;
            this.n = this.currentQuestion.question.length + 1;
            this.textBuffer = this.currentQuestion.question;
        },
        buzz: function() {
            if (this.timesBuzzed < 1 && !this.currentQuestion.exists) {
                this.canBuzz = true;
                this.focused = true;
                this.pause = true;
                this.timerBuffer = 70;
                this.timesBuzzed++;
            }
        },
        nextQuestion: function() {
            var self = this;
            db.ref("questions/" + self.selected.subject + "/count").on('value', function(int) {
                db.ref("questions/" + self.selected.subject + "/list/" + getRandomInt(0, int.val() + 1)).on('value', function(snapshot) {
                    self.currentQuestion = snapshot.val()
                })
            });
            this.canBuzz = false;
            this.n = 0;
            this.pause = false;
            this.timerBuffer = -1;
            this.timesBuzzed = 0;
        },
        keys: function(e) {
            if (e.keyCode == 32)
                this.buzz();
            if (e.keyCode == 80 && e.target.localName != "input")
                this.toggleBuffer();
            if (e.keyCode == 78 && e.target.localName != "input")
                this.nextQuestion();
        },
        submit: function() {
            this.canBuzz = false;
            this.focused = false;
            this.timerBuffer = -1;
            if (check(this.input, this.currentQuestion.answers)) {
                this.consoleBuffer.unshift({
                    text: "Correct! The answer was " + this.currentQuestion.answerText,
                    style: {
                        'c-alerts__alert--success': true,
                    },
                    time: 5000,
                });
                if (this.textBuffer.indexOf("*") == -1) {
                    this.score = this.score + 10;
                } else {
                    this.score = this.score + 15;
                }
            } else {
                this.consoleBuffer.unshift({
                    text: "Incorrect! The answer was " + this.currentQuestion.answerText,
                    style: {
                        'c-alerts__alert--error': true,
                    },
                    time: 5000,
                });
                if (this.n != this.currentQuestion.question.length)
                    this.score = this.score - 5;
            }
            this.input = "";
            this.endQuestion();
        },
    }
});
