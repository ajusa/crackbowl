var user;
firebase.auth().onAuthStateChanged(function(result) {
    user = result;
    vm.$data.user = user;
    if (user) {
        vm.$dispatch('alert', { text: "Welcome " + user.displayName, style: { 'c-alerts__alert--success': true } });
        db.ref("users/" + user.uid + "/name").set(user.displayName)
    }
});
Vue.transition('bounce', {
    enterClass: 'bounceInLeft',
    leaveClass: 'bounceOutRight'
})

var vm = new Vue({
    el: 'body',
    data: {
        user: firebase.auth().currentUser,
        alerts: [],
        currentView: "",
    },
    ready: function() {
        var self = this;

        this.$events.on('alert', function(msg) {
            self.alerts.unshift(msg)
        });
        this.$events.on('removeAlert', function(msg) {
            self.alerts.$remove(msg)
        })
    },
    methods: {
        logOut: function() {
            var self = this;
            firebase.auth().signOut().then(function() {
                self.$dispatch('alert', { text: "Signed out successfully", style: { 'c-alerts__alert--success': true } })
                self.user = null;
            });
        },
        logIn: function() {
            swal({
                title: '<h4>Sign In</h4>',
                type: 'question',
                html: '<a class="button" onclick="vm.google()">Sign in with Google</a> <br>' +
                    '<a class="button" disabled>Sign in with Facebook [WIP]</a>',
                showConfirmButton: true,
                confirmButtonText: 'Cancel',
                buttonsStyling: false,
                confirmButtonClass: 'button'
            })
        },
        google: function() {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithRedirect(provider);

        },
        facebook: function() {
            var provider = new firebase.auth.FacebookAuthProvider();
            firebase.auth().signInWithRedirect(provider);
        },
        info: function() {
            swal({
                title: '<h4>About Crackbowl</h4>',
                type: 'info',
                html: 'Crackbowl is a project made by <a href="http://www.github.com/ajusa" target="_blank">@ajusa</a>, with some help from Dark_P1ant. It is open source, ' +
                    'so feel free to contribute if you like making <a href="http://www.github.com/ajusa/crackbowl" target="_blank">cancer.</a>',
                showConfirmButton: true,
                confirmButtonText: 'Close',
                buttonsStyling: false,
                confirmButtonClass: 'button'
            })
        },

    },
    events: {
        'alert': function(msg) {
            this.alerts.unshift(msg)
        },
        'removeAlert': function(msg) {
            this.alerts.$remove(msg)
        },
    },
});
//Routing
page.base('/#');
page('/', function() {
    vm.$data.currentView = "questionview";
})
page('/stats', function() {
    vm.$data.currentView = "statview";
})
page.start()
