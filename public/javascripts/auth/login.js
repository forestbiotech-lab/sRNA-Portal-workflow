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
      loadGooglePic(null,data.gPicture)
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

function init() {
  gapi.load('auth2', function() {
    /* Ready. Make a call to gapi.auth2.init or some other API */
  });
}


async function onSignIn(googleUser){
  let attempt=0
  const maxTries=3
  if(googleUser==null){
    if(gapi.auth2){
      try{
        googleUser=await getGoogleUser()
        login(googleUser)
      }catch(err){
        loadGoogleAuth()
       }
    }else{
      loadGoogleAuth()
    }
  }else{
    try{
      login(googleUser)  
    }catch(err){
      loadGoogleAuth()
    }
  }
  function loadGoogleAuth(){
    gapi.load("auth2",async function(){
      let googleUser=await getGoogleUser()
      login(googleUser)
    })
  }
  async function getGoogleUser(){
    let host=document.location.host=="localhost:3000"? 'single_host_origin' : document.location.host
    GoogleAuth=await gapi.auth2.init({client_id:getClient_id_from_DOM(),cookie_policy:host})
    if(!GoogleAuth.isSignedIn.get()){
      console.log("Sign in!")
      return await signUser(GoogleAuth)
    }else{
      googleUser=await GoogleAuth.currentUser.get()
      return googleUser
    }
  }
  function get_id_token(googleUser){
    try{
      id_token=googleUser.getAuthResponse().id_token
      if(id_token==null){
        throw new Error(`Null id token from GoogleUser! Try a new request!`)  
      }else{
        return id_token
      }
    }catch(err){
      throw new Error(`Unable to get id token from GoogleUser!\n Error: ${err}`)
    }
  }
  function login(GoogleUser){
    try{
      let ginfo={id_token:get_id_token(GoogleUser)}
      verifyGoogleUser(ginfo)
      loadGooglePic(googleUser)
    }catch(err){
      retry()
    }
  }
  async function signUser(GoogleAuth){
    try{
      return await GoogleAuth.signIn()
    }catch(err){
      retry()
    }
  }
  function retry(){
    attempt++
    if(attempt<maxTries){
      loadGoogleAuth()
    }else{
      console.log("Unable to use google OAuth2!")
    }
  }
  function getClient_id_from_DOM(){
    let google_meta=document.getElementsByTagName('meta')
    return google_meta.namedItem('google-signin-client_id').getAttribute('content')
  }  
}

function loadGooglePic(googleUser,url){
  if(url){
    let img=document.createElement('img')
    img.setAttribute('src',url)
    img.setAttribute('height',"25px")
    //img.setAttribute('title',profile.getName())
    $('span.glyphicon.glyphicon-user').closest('a').prepend(img)
    $('span.glyphicon.glyphicon-user').hide()        
  }else{
    let profile = googleUser.getBasicProfile();
    let img=document.createElement('img')
    img.setAttribute('src',profile.getImageUrl())
    img.setAttribute('height',"25px")
    img.setAttribute('title',profile.getName())
    $('span.glyphicon.glyphicon-user').closest('a').prepend(img)
    $('span.glyphicon.glyphicon-user').hide()    
  }
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
        document.location="/auth/profile"
      }
      if(data=="New user create from thirdparty account! Reloading page!"){
        document.location="/auth/profile"
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