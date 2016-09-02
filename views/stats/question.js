Vue.component('question', {
    props: ['data'],

    template: '#question',
    data: function() {
        return {}
    },
    methods: {
        popup: function() {
            swal({
                type: 'info',
                html: "<h4>" + this.data.heading + "</h4>" +
                    "<p>" + this.data.question + "</p>"+
                    "<p class='b'> Answer: " + this.data.answerText+"</p>",
                showConfirmButton: true,
                confirmButtonText: 'Okay',
                buttonsStyling: false,
                confirmButtonClass: 'button'
            })
        },
    },
});
