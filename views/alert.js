Vue.component('alert', {
    props: ['data'],

    template: '<div class="w-100 white pv2 ph3 mv2 dt" v-bind:class="data.style"><div class="dtc v-mid">{{data.text}}</div> <span @click="remove" class="dtc f3 v-mid fr">×</span></div>',
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
