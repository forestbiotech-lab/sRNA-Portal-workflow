const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const MailComposer = require("nodemailer/lib/mail-composer");




class Gmail{
    constructor(SCOPES, TOKEN_PATH, CREDENTIALS_PATH){
        const credentials={}
        credentials.TOKEN_PATH= TOKEN_PATH? TOKEN_PATH : path.join(process.cwd(), 'token.json');
        credentials.CREDENTIALS_PATH= CREDENTIALS_PATH? CREDENTIALS_PATH : path.join(process.cwd(), 'credentials.json');
        // If modifying these scopes, delete token.json.
        credentials.SCOPES=SCOPES? SCOPES : ['https://www.googleapis.com/auth/gmail.compose','https://www.googleapis.com/auth/gmail.readonly',]; //'https://www.googleapis.com/auth/gmail.metadata'
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        Object.freeze(credentials)
        this.credentials=credentials
        this.client=null  //Use authorize to get one
        this.api=null // Use authorize to get one
    }
    /**
     * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
     *
     * @param {OAuth2Client} client
     * @return {Promise<void>}
     */
    async saveCredentials(client) {
        const content = await fs.readFile(this.credentials.CREDENTIALS_PATH);
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const payload = JSON.stringify({
            type: 'authorized_user',
            client_id: key.client_id,
            client_secret: key.client_secret,
            refresh_token: client.credentials.refresh_token,
        });
        await fs.writeFile(this.credentials.TOKEN_PATH, payload);
    }

    /**
     * Reads previously authorized credentials from the save file.
     *
     * @return {Promise<OAuth2Client|null>}
     */
    async loadSavedCredentialsIfExist() {
        try {
            const content = await fs.readFile(this.credentials.TOKEN_PATH);
            const credentials = JSON.parse(content);
            return google.auth.fromJSON(credentials);
        } catch (err) {
            return null;
        }
    }
    /**
     * Load or request or authorization to call APIs.
     *  Set arg to true to allow a new request
     */
    async authorize(newAuth) {
        let client = await this.loadSavedCredentialsIfExist();
        if (client && !newAuth) {
            this.client = client;
            this.api = google.gmail({version: 'v1', auth:client});
        }else {
            console.log("Requires verification on browser")
            client = await authenticate({
                scopes: this.credentials.SCOPES,
                keyfilePath: this.credentials.CREDENTIALS_PATH,
            });
            if (client.credentials) {
                await this.saveCredentials(client);
            }
            this.client = client;
            this.api = google.gmail({version: 'v1', auth:client});
        }
    }

    /**
     * Lists the labels in the user's account.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    async listMessages(options) {
        //TODO process options
        try {
            //const gmail = google.gmail({version: 'v1', auth:this.client});
            const res = await this.api.users.messages.list({
                userId: 'me',
            });
            const messages = res.data.messages;
            if (!messages || messages.length === 0) {
                console.log('No labels found.');
                return;
            }
            console.log('Messages:');
            messages.forEach((msg) => {
                console.log(`- ID:${msg.id} => ThreadId ${msg.threadId}`);
            });
        }catch(e){
            console.log("Error listing messgs:",e)
        }
    }

    async getMessage(id) {
        if(id) {
            try {
                const res = await this.api.users.messages.get({
                    userId: 'me',
                    id
                });
                const messages = res.data.messages;
                let data=JSON.stringify(res.data)
                if (!messages || messages.length === 0) {
                    console.log('No labels found.');
                    return;
                }
                console.log('Messages:');
                messages.forEach((msg) => {
                    console.log(`- ID:${msg.id} => ThreadId ${msg.threadId}`);
                });
            }catch (e) {
                console.log("Error getting this message: ",e)
            }
        }
    }
    async sendEmail(msg) {
        try {
            const res = await this.api.users.messages.send({
                userId: 'me',
                'resource': {
                    raw: Buffer.from(await msg.message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
                }
            })
            return res.data
        }catch (e) {
            console.log("Error sending email: ",e)
        }
    }

    /**
     * Lists the labels in the user's account.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    async listLabels() {
        try {
            const res = await this.api.users.labels.list({
                userId: 'me',
            });
            const labels = res.data.labels;
            if (!labels || labels.length === 0) {
                console.log('No labels found.');
                return;
            }
            console.log('Labels:');
            labels.forEach((label) => {
                console.log(`- ${label.name}`);
            });
        }catch (e) {
            console.log("Error listing labels:", e)
        }
    }
    async addAttachment(path){
        try{

        }catch (e) {
            console.log("Error loading attachment: ",e)
        }
    }
}












class Message{
    constructor(to,subject,inreplytoId) {
        this.headers={}
        this.headers.To=to
        this.headers.Subject=subject
        this.headers.From="sRNA Plant Portal <srnaplantportal@gmail.com>"
        if(inreplytoId) this.headers["In-Reply-To"]=inreplytoId
        this.email=Object.entries(this.headers).reduce((acc,cur)=>acc+cur[0]+":"+cur[1]+"\r\n","")
        this.msg=null
        this.text=null
        this.html=null
        this.attachments=[]

    }
    fileAttachment(fileName,path){
        this.attachments.push({
            fileName,path
        })
    }
    body(msg){
        this.message=msg
    }
    set message(msg){
        this.text=msg
    }
    get message(){
        let that=this
        let options=Object.entries(that.headers).reduce((acc,cur)=> {
            acc[cur[0].toLowerCase()] = cur[1]
            return acc
        },{})
        options.text=this.text
        options.html=this.html
        options.attachments=this.attachments  //TODO see how here: https://nodemailer.com/extras/mailcomposer/#attachments
        const mail=new MailComposer(options);
        return new Promise((res,rej)=>{
            mail.compile().build(function (err,message){
                if(err) rej(err)
                res(message.toString())
            })
        })
        //this.email+="\r\n"+this.msg
        //return Buffer.from(this.email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
    }

}

module.exports=async function(email,subject,body,html,attachment){
    let gmail=new Gmail()
    await gmail.authorize(newAuth=false)
    //gmail.listMessages()
    //gmail.getMessage('186cc82ec3866340')
    let msg=new Message(email,subject)
    msg.body(body)
    msg.html=html
    msg.fileAttachment=attachment
    let result=await gmail.sendEmail(msg)
    return result
}