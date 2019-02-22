const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const database = require('./database');

const serverOptions = {
  port: process.env.PORT || 3000
};

const mappings = {
  'home': '/',
  'ask': '/ask',
  'askStatus': '/ask/status',
  'give': '/give',
  'clear': '/clear'
};

const globalVars = {
  requestCount: 0
};

// This function sets the URL mappings for endpoints.
function setMappings(app) {

  app.use(bodyParser.json());
  app.use(express.static('public'));

  app.all('*', function(req, res, next) {
    req.num = globalVars.requestCount++;

    console.log(`[INFO][REQ ${req.num}] ` +
      `Mapped ${req.method} ${req.originalUrl}`);

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');

    res.type('json');

    try {
      next();
    } catch (except) {
      console.log(`[ERROR][REQ ${req.num}] ${except}`);
      res.status(500);
    }

    console.log(`[INFO][REQ ${req.num}] ` +
      `Replying to request with HTTP ${res.statusCode}`);
    res.end();
  });

  app.get(mappings['home'], function(req, res) {
    res.status(200).send('Hello World!');
  });

  app.post(mappings['ask'], function(req, res) {
    let responseCode = 201;
    let id = {'id': database.addAsk(req, req.body)};

    res.status(responseCode).send(id);
  });

  app.get(mappings['ask'], function(req, res) {
    let responseCode = 200;
    let asks = database.getAllAsks(req);

    res.status(responseCode).send(asks);
  });

  app.put(mappings['askStatus'], function(req, res) {
    let responseCode = 200;
    let updatedStatus = database.fulfillAskStatus(req, req.body);

    let id = {};
    if (updatedStatus == '') {
      responseCode = 400;
      id = {'error': 'The given ID was not found.'};
    } else {
      id = {'id': updatedStatus};
    }

    res.status(responseCode).send(id);
  });

  app.post(mappings['give'], function(req, res) {
    let responseCode = 200;
    let id = {'id': database.addGive(req, req.body)};

    res.status(responseCode).send(id);
  });

  app.get(mappings['give'], function(req, res) {
    let responseCode = 200;
    let gives = database.getAllGives(req);

    res.status(responseCode).send(gives);
  });

  app.post(mappings['clear'], function(req, res) {
    let responseCode = 200;
    database.clearAll(req);

    res.status(responseCode).end();
  });

}

function main() {
  setMappings(app);
  app.listen(serverOptions['port'], () => console.log(
      `[INFO] Server listening on http://localhost:${serverOptions['port']}.`
  ));
}

main();
