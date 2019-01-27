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
  'ask': '/ask',
  'give': '/give',
  'giveStatus': '/give/status',
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
    var responseCode = 201;
    var body = {};

    try {
      var body = {
        'id': database.addAsk(JSON.parse(req.body))
      };
    } catch (except) {
      console.log('Error: ' + except);
      responseCode = 500
    }

    response.writeHead(responseCode);
    console.log('Replying to request with HTTP ' + response.statusCode);
    console.log();
    response.end(JSON.stringify(body));
  });

  dispatcher.onGet(mappings['ask'], function(req, response) {
    var responseCode = 200;
    var body = {};

    try {
      var body = database.getAllAsks();
    } catch (except) {
      console.log('Error: ' + except);
      responseCode = 500
    }

    response.writeHead(responseCode);
    console.log('Replying to request with HTTP ' + response.statusCode);
    console.log();
    response.end(JSON.stringify(body));
  });

  dispatcher.onPost(mappings['give'], function(req, response) {
    var responseCode = 200;
    var body = {};

    try {
      var body = {
        'id': database.addGive(JSON.parse(req.body))
      };
    } catch (except) {
      console.log('Error: ' + except);
      responseCode = 500
    }

    response.writeHead(201);
    console.log('Replying to request with HTTP ' + response.statusCode);
    console.log();
    response.end(JSON.stringify(body));
  });

  dispatcher.onGet(mappings['give'], function(req, response) {
    var responseCode = 200;
    var body = {};

    try {
      var body = database.getAllGives();
    } catch (except) {
      console.log('Error: ' + except);
      responseCode = 500
    }

    response.writeHead(responseCode);
    console.log('Replying to request with HTTP ' + response.statusCode);
    console.log();
    response.end(JSON.stringify(body));
  });

  dispatcher.onPost(mappings['giveStatus'], function(req, response) {
    var responseCode = 200;
    var body = {};

    try {
      var updatedStatus = database.fulfillGiveStatus(JSON.parse(req.body));
    } catch (except) {
      console.log('Error: ' + except);
      responseCode = 500;
    }

    if (updatedStatus == "") {
      responseCode = 400;
      body = {
        "error": "The given ID was not found."
      };
    } else {
      body = {
        'id': updatedStatus
      };
    }

    response.writeHead(responseCode);
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
