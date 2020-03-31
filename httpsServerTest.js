// curl -k https://localhost:8000/
const https = require('https');
const fs = require('fs');

const options = {
    key:fs.readFileSync('.keys/wss-key.pem'),
    cert:fs.readFileSync('.keys/wss-cert.pem')
};

https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);