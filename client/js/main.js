window.onload = function() {
    new Vue({
        el: '#app',
        mixins: [VueFocus.mixin],
        ready: function() {
            // GET /someUrl
            this.$http.get('https://ajusa.github.io/crackbowl-scraper/output.json').then(function(response) {
                this.questions = response.json();
                this.nextQuestion();
                this.updateBuffer()
            });
            window.addEventListener('keyup', this.focus)

        },
        data: {
            questions: [],
            currentQuestion: {},
            input: "",
            textBuffer: "",
            pause: false,
            n: 0,
            focused: false,
            consoleBuffer: [],
        },
        methods: {
            updateBuffer: function() {
                var self = this;

                setInterval(function() {
                    if (self.n < (self.currentQuestion.question.length) && !self.pause) {
                        self.textBuffer = self.currentQuestion.question.substring(0, self.n + 1);
                        self.n++;
                    }
                }, 50);

            },
            buzz: function() {
                this.pause = true;
            },
            unBuzz: function() {
                this.pause = false;
            },
            nextQuestion: function() {
                this.focused = false;
                this.n = 0;
                this.currentQuestion = this.questions[getRandomInt(0, this.questions.length + 1)];

            },
            focus: function(e) {
                if (e.keyCode == 32)
                    this.focused = true;
            },
            check: function(arr) {
                var scores = [0]
                for (var i = arr.length - 1; i >= 0; i--) {
                    for (var j = this.currentQuestion.answers.length - 1; j >= 0; j--) {
                        scores.push(similar(arr[i], this.currentQuestion.answers[j]))
                    }

                }
                avg = 0;
                for (var i = scores.length - 1; i >= 0; i--) {
                    if (scores[i] > .75) {
                        avg = 1
                    }
                }
                if (avg > .75) {
                    this.consoleBuffer.push("Correct. The answer was " + this.currentQuestion.answerText);
                    this.nextQuestion();
                } else {
                    this.consoleBuffer.push("Wrong. The answer was " + this.currentQuestion.answerText);
                    this.nextQuestion();
                }

            },
            submit: function() {
                answer = this.input.trim();
                this.input = "";
                for (var i = chars.length - 1; i >= 0; i--) {
                    newanswer = answer;
                    do {
                        answer = newanswer;
                        newanswer = answer.replace(chars[i], " ");
                    }
                    while (newanswer != answer);
                }
                for (var i = words.length - 1; i >= 0; i--) {
                    answer = answer.split(" " + words[i] + " ").join(" ");
                }
                arr = answer.split(" ");
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i] == "") {
                        arr.splice(i, 1)
                    }
                }
                arr = arr.filter(function(value, index, array) {
                    return array.indexOf(value) == index;
                });
                this.check(arr);
            }
        }
    })
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
var words = ["mention", "is", "either", "before", "or", "accept", "like", "answers", "[", "]", "on", "until", "it", "mentioned", "synonyms", "the", "do", "any", "kind", "of", "mention", "a"];
var chars = [".", "[", "]", ",", "(", ")", ";", '"'];

function similar(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}
