FROM node:14
# Create app directory
WORKDIR /usr/src/websocket_server

COPY package*.json ./

RUN npm install --production


COPY . .

EXPOSE 8080

CMD [ "node","bin/websocket.js" ]

