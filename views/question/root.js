var bar;
Vue.component('questionview', {
    template: "#questionView",
    mixins: [VueFocus.mixin],
    ready: function() {
        this.updateBuffer()
        this.startTimer();
        window.addEventListener('keyup', this.keys)
        bar = new ProgressBar.Line('#timer', {
            easing: 'linear',
            strokeWidth: 3,
            from: { color: '#f1c40f' },
            to: { color: '#e74c3c' },
            trailColor: '#eee',
            trailWidth: 3,
            duration: 7000,
            svgStyle: { width: '100%', height: '100%' },
            step: function(state, bar) {
                bar.path.setAttribute('stroke', state.color);
            }
        });
    },
    data: function() {
        return {
            currentQuestion: { exists: true, },
            input: "",
            textBuffer: "Welcome to crackbowl! Hit the next button (or n) to start a question, hit buzz (or space) to buzz, and hit pause / play(p) to toggle the question being read. Questions are read here ",
            pause: false,
            n: 0,
            focused: false,
            canBuzz: false,
            timerBuffer: -1,
            timesBuzzed: 1,
            selected: { level: "HS", subject: "All" },
            score: 0,
        }
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
                if (self.n < (self.currentQuestion.question.length || 0) && !self.pause) {
                    self.textBuffer = self.currentQuestion.question.substring(0, self.n + 1);
                    self.n++;
                } else if (self.n == (self.currentQuestion.question.length || 0)) {
                    self.timerBuffer = 30;
                    bar.animate(1);
                    self.n++
                }
            }, 50);
        },
        pauseBuffer: function() {
            this.pause = true;
        },
        playBuffer: function() {
            this.pause = false;
        },
        toggleBuffer: function() {
            this.pause = !this.pause
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
                bar.animate(1);
                this.timesBuzzed++;
            }
        },
        nextQuestion: function() {
            var self = this;
            if (this.selected.subject == "All") {
                subject = subjects[Math.floor(Math.random() * subjects.length)];
            } else {
                subject = this.selected.subject;
            }
            db.ref("questions/" + subject + "/count").on('value', function(int) {
                db.ref("questions/" + subject + "/list/" + getRandomInt(0, int.val() + 1)).on('value', function(snapshot) {
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
            this.timerBuffer = -1;
            if (check(this.input, this.currentQuestion.answers)) {
                this.currentQuestion.correct = true;
                this.$emit('correct', this.currentQuestion)
                if (this.textBuffer.indexOf("*") == -1)
                    this.score = this.score + 10;
                else
                    this.score = this.score + 15;
            } else {
                this.currentQuestion.correct = false;
                this.$emit('incorrect', this.currentQuestion)
                if (this.n < this.currentQuestion.question.length)
                    this.score = this.score - 5;
            }
            this.input = "";
            this.endQuestion();
        },
    },
    events: {
        'correct': function(msg) {
            if (user)
                db.ref("users/" + user.uid + "/questions").push(this.currentQuestion)
            this.$events.emit('alert', { text: "Correct! The answer was " + this.currentQuestion.answerText, style: { 'c-alerts__alert--success': true } });
        },
        'incorrect': function(msg) {
            if (user)
                db.ref("users/" + user.uid + "/questions").push(this.currentQuestion)
            this.$events.emit('alert', { text: "Incorrect! The answer was " + this.currentQuestion.answerText, style: { 'c-alerts__alert--error': true } });
        },
    },
});
