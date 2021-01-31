const http = require('http');
const app = require('./app');

let port = process.env.PORT !== undefined ? process.env.PORT : 3000;

// create a simple http server and pass in app which acts as a request handler, app is exported from app.js.
const server = http.createServer(app);

server.listen(port, () => console.log(`Listening on port ${port}`));
