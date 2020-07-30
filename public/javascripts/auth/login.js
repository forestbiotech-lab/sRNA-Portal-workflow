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

function onSignIn(googleUser){
  gapi.load("auth2",async function(){
    let google_meta=document.getElementsByTagName('meta')
    let client_id=google_meta.namedItem('google-signin-client_id').getAttribute('content')
    let googleAuth=await gapi.auth2.init({client_id})
    let googleUser=googleAuth.currentUser.get()
    let ginfo={id_token:googleUser.getAuthResponse().id_token}
    verifyGoogleUser(ginfo)  
    loadGooglePic(googleUser)
  })


  // Useful data for your client-side scripts:
  //var profile = googleUser.getBasicProfile();
  //Remove this once the necessary data is extracted
  //console.log("ID: " + profile.getId()); // Don't send this directly to your server!
  //console.log('Full Name: ' + profile.getName());
  //console.log('Given Name: ' + profile.getGivenName());
  //console.log('Family Name: ' + profile.getFamilyName());
  //console.log("Image URL: " + profile.getImageUrl());
  //console.log("Email: " + profile.getEmail());

  // The ID token you need to pass to your backend:
  

}

function loadGooglePic(googleUser){
  let profile = googleUser.getBasicProfile();
  let img=document.createElement('img')
  img.setAttribute('src',profile.getImageUrl())
  img.setAttribute('height',"25px")
  img.setAttribute('title',profile.getName())
  $('span.glyphicon.glyphicon-user').closest('a').prepend(img)
  $('span.glyphicon.glyphicon-user').hide()
  
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
      if(data=="Logged in! Reloading page!"){
        //document.location.reload()
      }
      if(data=="New user create from thirdparty account! Reloading page!"){
        //document.location="/auth/profile"
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