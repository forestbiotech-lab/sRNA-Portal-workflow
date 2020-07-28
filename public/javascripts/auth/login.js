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

function onSignIn(googleUser) {
  // Useful data for your client-side scripts:
  var profile = googleUser.getBasicProfile();
  //Remove this once the necessary data is extracted
  //console.log("ID: " + profile.getId()); // Don't send this directly to your server!
  //console.log('Full Name: ' + profile.getName());
  //console.log('Given Name: ' + profile.getGivenName());
  //console.log('Family Name: ' + profile.getFamilyName());
  //console.log("Image URL: " + profile.getImageUrl());
  //console.log("Email: " + profile.getEmail());

  // The ID token you need to pass to your backend:
  var id_token = googleUser.getAuthResponse().id_token;
  let ginfo={id_token}
  verifyGoogleUser(ginfo)

}


function verifyGoogleUser(ginfo){
  $.ajax({
    url:"/auth/login/verify/google-token",
    method:"POST",
    data:ginfo,
    success:function(data,textStatus,jqXHR){
      let alert=document.createElement("div")
      alert.classList="alert alert-danger"
      alert.getAttribute("role","alert")
      alert.textContent=data
      $('body').prepend(alert)
      if(data=="Logged in! Reload page!"){
        //document.location.reload()
      }


    },
    error:function(jqXHR,textStatus,error){
      console.log(error)
    }
  })
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
  });
}