window.app=new Vue({
    el: "#login-form",
    data: {
        retry: 0,
        email:"",
    },
    methods:{
        resetPassword(){
            if(this.email.match(/\w+@\w+\.\w+/)==null){
                $('#login-email1').tooltip({title:"Email required to reset password!",placement:"left"})
                $('#login-email1').tooltip("show")
            }else{
                $('form#login-form').attr('action',"/auth/login/reset")
                $('button#submit').click()
            }
        }
    },
    beforeMount:function(){
        this.retry=$("#retry").val()
    }
})