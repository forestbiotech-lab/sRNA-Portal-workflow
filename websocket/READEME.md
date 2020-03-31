## WebSocket Secure
## Generating self-signed certificates for wws
``` bash
    openssl req -x509 -newkey rsa:4096 -keyout wss-key.pem -out wss-cert.pem -days 365
```