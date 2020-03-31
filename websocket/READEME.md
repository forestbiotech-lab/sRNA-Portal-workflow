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
