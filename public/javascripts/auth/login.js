

$(document).ready(()=>{

  $.ajax({
    url:"/auth/loggedin",
    success:function(data,textStatus,jqXHR){
      setupLoginbuttons(data)
      redirect()
    },
    fail:function(jqXHR,textStatus,error){
      setupLogin()
    }
  })

  function setupLoginbuttons(data){
    $('.menu .row').removeClass('d-none')
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
  function redirect(){
    let redirect=$('a.redirect')
    if (redirect.length==1){
      document.location=redirect.attr('href')
    }
  }

})


// Refactored but not tested
// NOT used currently directly
async function onSignIn(googleUser){
  let attempt=0
  const maxTries=3
  if(googleUser==null){
    if(google){
      try{
        if(google.accounts.id.initialize) {
          getGoogleUser()
        }
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

    }
  }
  async function getGoogleUser(){
    google.accounts.id.initialize({
      client_id:getClient_id_from_DOM(),
      callback:login
    })
  }
  function loadGoogleAuth(){
    let scriptTarget2 = $('script#actions')[0]
    let script2 = document.createElement('script')
    script2.src="https://accounts.google.com/gsi/client"
    scriptTarget2.parentNode.insertBefore(script2, scriptTarget2)
    getGoogleUser()
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
      displayToast("Login error","Unable to use google to sign in!",4000)
    }
  }
}

function getClient_id_from_DOM(){
  let google_meta=document.getElementsByTagName('meta')
  return google_meta.namedItem('google-signin-client_id').getAttribute('content')
}  

function loadGooglePic(googleUser,url){
  if(url){
    let img=document.createElement('img')
    img.setAttribute('src',url)
    img.setAttribute('height',"25px")
    $('span.glyphicon.glyphicon-user').closest('a').prepend(img)
    $('span.glyphicon.glyphicon-user').hide()        
  }else{
    if(googleUser){
      let profile = googleUser.getBasicProfile();
      let img=document.createElement('img')
      img.setAttribute('src',profile.getImageUrl())
      img.setAttribute('height',"25px")
      img.setAttribute('title',profile.getName())
      $('span.glyphicon.glyphicon-user').closest('a').prepend(img)
      $('span.glyphicon.glyphicon-user').hide()    
    }
  }
}

function verifyGoogleUser(ginfo){
  //might not be the most correct.
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
      displayToast("Error","Login failed!",4000)
    }
  })
}

function signOut() {
  try{
    google.accounts.id.revoke('user@google.com', done => {
      console.log('User signed out.');
      document.location="/auth/logout"
    });
  }catch(err){
    document.location="/auth/logout"
  } 
}

