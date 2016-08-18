Vue.component('alert', {
    props: ['data'],

    template: '<div class="w-100 white pv3 ph4 mb3 dt" v-bind:class="data.style"><div class="dtc v-mid">{{data.text}}</div> <a @click="remove" class="dtc link white f2 v-mid fr">×</a></div>',
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
