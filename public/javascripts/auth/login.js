$(document).ready(()=>{

  $.ajax({
    url:"/auth/loggedin",
    success:function(data,textStatus,jqXHR){
      setupLoginbuttons(data)
    },
    fail:function(jqXHR,textStatus,error){
      setupLogin()
    }
  })

  function setupLoginbuttons(data){
    if(data.logged==true){
      setupLogout()
    }else{
      setupLogin()
    }
  }

  function setupLogin(){
    //hide logout
    $('.menu .menu-item.logout-btn').hide()
    $('.menu .menu-item.profile-btn').hide()
  }
  function setupLogout(){
    $('.menu .menu-item.login-btn').hide()
    //hide login
  }
})