## WebSocket Secure
## Generating self-signed certificates for wws
``` bash
    openssl req -x509 -nodes -newkey rsa:4096 -keyout wss-key.pem -out wss-cert.pem -days 365
```
## Generating letsecrypt certs
``` bash
    apt install certbot
    certbot certonly
    #Standalone fill necessary requriements
    key=/etc/letsencrypt/live/[domain]/privkey.pem
    cert=/etc/letsencrypt/live/[domain]/cert.pem

    #Renewal of certs
    certbot renew
```



## Add domain and port to config file copy or link the .config_res.js file from main server
``` javascript 

module.exports = {
  sql: {
    host:     '127.0.0.1', 
    database: 'myDB',
    username: 'user',
    password: 'secret',
    operatorsAliases: false,
    dialect: 'mysql', // PostgreSQL, MySQL, MariaDB, SQLite and MSSQL See more: http://docs.sequelizejs.com/en/latest/
    logging: console.log,   //True starts to make it cry.
    timezone: '+00:00',
  },
  seedDB:false,
  seedMongoDB:false,
  seedDBForce:true,
  db:'sql', // mongo,sql if you want to use any SQL change dialect above in sql config
  cookie:{
    seed:"randomSeedToWriteHere",
    keylist:[
      "kçlklçk",
      "kjlkjlkjlkj",
      "jlkjlkjkjlk"
    ]
  },
  host:{
    domain:""
  },
  websocket:{
    port:"8080"
  }

}
```

Build image & run docker container
``` bash
docker build -t "srna:websocket_server" .
docker run srna:websocket_server
``` 

TODO add a way to expose the certificates for production server

