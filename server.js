const express = require('express');
const http = require('http');
const app = express();
const path = require('path');

module.exports = (options) => {
  console.log("starting to serve with options", options);
  app.use('/data', express.static('data'));
  app.use('/dist', express.static('dist'));
  app.use('/test', express.static('test'));
  const server = http.createServer( app )
  const port = options && options.port ? options.port : 3000;
  server.listen(port);
  console.log(`listening on ${port}`);
  return server;
};
