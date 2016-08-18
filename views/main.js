var user;
firebase.auth().onAuthStateChanged(function(result) {
    user = result;
    vm.$data.user = user;
    if (user) {
        swal({
                title: '<h4>Welcome!</h4>',
                type: 'success',
                html: "Welcome back " + user.displayName,
                showConfirmButton: true,
                confirmButtonText: 'Okay',
                buttonsStyling: false,
                confirmButtonClass: 'button'
            })
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
        currentView: "questionview",
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
                swal({
                title: '<h4>Signed Out!</h4>',
                type: 'success',
                html: "Signed out successfully",
                showConfirmButton: true,
                confirmButtonText: 'Okay',
                buttonsStyling: false,
                confirmButtonClass: 'button'
            })
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