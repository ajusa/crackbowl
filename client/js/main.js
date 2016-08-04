var db = firebase.database()
var user;
firebase.auth().getRedirectResult().then(function(result) {
    user = result.user;
    if (user) {
        console.log(result.user)
        vm.$data.log = "Log Out"
    }
})
var vm = new Vue({
    el: 'body',
    mixins: [VueFocus.mixin],
    ready: function() {
        this.updateBuffer()
        this.startTimer();
        window.addEventListener('keyup', this.keys)
    },
    data: {
        questions: [],
        currentQuestion: { exists: true, },
        input: "",
        textBuffer: "Welcome to crackbowl! Hit the next button (or n) to start a question, hit buzz (or space) to buzz, and hit pause / play(p) to toggle the question being read. Questions are read here ",
        pause: false,
        n: 0,
        focused: false,
        consoleBuffer: [],
        canBuzz: false,
        timerBuffer: -1,
        toggle: "Pause",
        timesBuzzed: 1,
        selected: { level: "HS", subject: "History" },
        score: 0,
        log: "Log In",
    },
    methods: {
        signIn: function() {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider);
        },
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
                    self.n++
                }
            }, 50);
        },
        toggleBuffer: function() {
            if (this.toggle == "Pause") {
                this.pause = true;
                this.toggle = "Play"
            } else {
                this.pause = false;
                this.toggle = "Pause"
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
                if (user)
                    db.ref("users/" + user.uid + "/correct").push(this.currentQuestion)
                this.consoleBuffer.unshift({
                    text: "Correct! The answer was " + this.currentQuestion.answerText,
                    style: { 'c-alerts__alert--success': true },
                });
                if (this.textBuffer.indexOf("*") == -1)
                    this.score = this.score + 10;
                else
                    this.score = this.score + 15;
            } else {
                if (user)
                    db.ref("users/" + user.uid + "/incorrect").push(this.currentQuestion)
                this.consoleBuffer.unshift({
                    text: "Incorrect! The answer was " + this.currentQuestion.answerText,
                    style: { 'c-alerts__alert--error': true },
                });
                if (this.n != this.currentQuestion.question.length)
                    this.score = this.score - 5;
            }
            this.input = "";
            this.endQuestion();
        },
    }
});