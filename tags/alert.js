Vue.component('alert', {
    props: ['data'],
    template: '<div class="c-alerts__alert" v-bind:class="data.style"><a @click="remove" class="c-button c-button--close">×</a> {{data.text}} </div>',
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
            this.$dispatch('removeAlert',this.data)
        },
    },
});
