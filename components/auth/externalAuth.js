const {OAuth2Client} = require("google-auth-library");
const CLIENT_ID=require('./../../.config_res').google.client_id
const Auth =  require('node_auth_module')
const authModule=new Auth(".config_auth.js")
const {loginAction,setLoginMetadata} = require("./procedures")

async function google(req,res){
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
        return await loginEmail(firstName,lastName,email,gPicture)
        async function loginEmail(firstName,lastName,email,gPicture){
            try{
                let error=null
                let userId=await authModule.auth.getIdFromEmail(email)
                let successMessage="Logged in through third party authentication!"
                if(userId instanceof Error){
                    //TODO
                    //create new user
                    userId= await authModule.auth.register(firstName,lastName,email,password=null,thirdparty=true)
                    if (userId instanceof Error) throw userId
                    successMessage="New user created from third-party account!"
                }
                let login=await loginAction(error,userId,thirdparty=true,successMessage)
                if(login instanceof Error) throw login
                login.gPicture=gPicture
                return login
            }catch(error){
                return error
            }
        }
        //const active= await tpAuth.lookUpPersonByEmailAuthentication(payload,options,callBack)


        // If request specified a G Suite domain:
        // const domain = payload['hd'];
    }
    return await verify().catch(error=>{
        let msg = error.message
        res.redirect("/?msg="+encodeURI(error.message))
    });

}

module.exports = { google }