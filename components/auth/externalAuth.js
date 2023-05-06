const {OAuth2Client} = require("google-auth-library");
const CLIENT_ID=require('./../../.config_res').google.client_id
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
const loginValidUser = require("./procedures").loginValidUser
function google(req,res){
    const client = new OAuth2Client(CLIENT_ID);
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        var firstName=payload.given_name
        var lastName=payload.family_name
        var email=payload.email
        var gPicture=payload.picture
        loginEmail(firstName,lastName,email)
        async function loginEmail(firstName,lastName,email){
            try{
                let error=null
                let userId=await authModule.auth.getIdFromEmail(email)
                if(userId instanceof Error){
                    //TODO
                    //create new user
                    let userId= await authModule.auth.register(firstName,lastName,email,password=null,thirdparty=true)
                    loginValidUser(error,userId,req,res,thirdparty=true,successMessage="New user create from thirdparty account! Reloading page!",gPicture)
                    //The user has been created
                }else{
                    loginValidUser(error,userId,req,res,thirdparty=true,successMessage="Logged in! Reloading page!",gPicture)
                }
            }catch(error){
                let msg = error.message
                res.redirect("/?msg="+encodeURI(error.message))
            }
        }
        //const active= await tpAuth.lookUpPersonByEmailAuthentication(payload,options,callBack)


        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    }
    verify().catch(error=>{
        let msg = error.message
        res.redirect("/?msg="+encodeURI(error.message))
    });

}

module.exports = { google }