var http = require('http');
var request = require('request');
var HttpDispatcher = require('httpdispatcher');
var dispatcher = new HttpDispatcher();

var database = require('./database');

const express = require('express');
const app = express();

const serverOptions = {
  port: process.env.PORT || 3000
};

const mappings = {
  'home': '/',
  'ask': '/ask'
};

// This function sets the URL mappings for endpoints.
function setMappings(dispatcher) {

  dispatcher.onGet(mappings['home'], function(req, response) {
    response.writeHead(200);
    console.log('Hello World!');
    console.log();
    response.end('Hello World!');
  });

  dispatcher.onPost(mappings['ask'], function(req, response) {
    console.log(JSON.parse(req.body));
    var body = {
      'id': database.addAsk(JSON.parse(req.body))
    };

    response.writeHead(201);
    console.log('Replying to request with HTTP ' + response.statusCode);
    console.log();
    response.end(JSON.stringify(body));
  });

  dispatcher.onGet(mappings['ask'], function(req, response) {
    var body = database.getAllAsks();

    response.writeHead(200);
    console.log('Replying to request with HTTP ' + response.statusCode);
    console.log();
    response.end(JSON.stringify(body));
  });

}

function main() {
  setMappings(dispatcher);

  var server = http.createServer(function(request, response) {
    console.log('Mapped ' + request.url);
    console.log();
    try {
      dispatcher.dispatch(request, response);
    } catch (except) {
      console.log('Error: ' + except);
    }
  });

  server.listen(serverOptions, function() {
    console.log('[INFO] Server listening on http://localhost:%s.', serverOptions['port']);
    console.log();
  });
}

main()
