Vue.component('alert', {
    template: "#alert-template",
    props: ['data'],
    ready: function() {
        this.startTimer();
    },
    data: function() {
        return { timeout: {}, }
    },
    methods: {
        startTimer: function() {
            var self = this;
            this.timeout = setTimeout(function() {
                if (!self.hasBeenRemoved)
                    self.remove();
            }, self.data.time || 7000)
        },
        remove: function() {
            clearTimeout(this.timeout)
            this.$parent.consoleBuffer.$remove(this.data)
        },
    },
});
