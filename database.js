const uuidv4 = require('uuid/v4');
const timestamp = require('unix-timestamp');

var asks = [];
var gives = [];

function copyJsonObject(object) {
  return JSON.parse(JSON.stringify(object));
}

const requestState = [
  'unmatched',
  'matched',
  'fulfilled'
];

function findAsk(id) {
  for (var i = 0; i < asks.length; i++) {
    if (id === asks[i]['id']) {
      return asks[i];
    }
  }
  return {};
}

function findGive(id) {
  for (var i = 0; i < gives.length; i++) {
    if (id === gives[i]['id']) {
      return gives[i];
    }
  }
  return {};
}

function convertAskGiveBody(requestBody) {
  var obj = { // Cloned fields from requestBody
    'user-name': requestBody['user-name'],
    'user-email': requestBody['user-email'],
    'user-location': requestBody['user-location'],
    'item': requestBody['item'],
    'quantity': requestBody['quantity']
  }

  // Additional fields
  var id = uuidv4();
  obj['id'] = id;
  obj['posted'] = timestamp.now();
  obj['status-value'] = 0;

  return obj;
};

function getStatus(obj) {
  return requestState[obj['status-value']];
}

function convertStatusValueToStatus(obj) {
  obj['status'] = getStatus(obj);
  delete obj['status-value'];
}

function connectAskGive(ask, give) {
  give['status-value']++;
  give['ask-id'] = ask['id'];
  give['match-name'] = ask['user-name']
  give['match-email'] = ask['user-email']
  give['match-location'] = ask['user-location']

  ask['status-value']++;
  ask['give-id'] = give['id']
  ask['match-name'] = give['user-name']
  ask['match-email'] = give['user-email']
  ask['match-location'] = give['user-location']

  console.log(
    '[DEBUG] Connected corresponding unmatched Give with id {' +
    give['id'] + '} to this Ask');
}

module.exports = {

  addAsk: function addAsk(requestBody) {
    var obj = convertAskGiveBody(requestBody);

    // Optional matching
    for (var i = 0; i < gives.length; i++) {
      // First unmatched Give which has the same item
      if (gives[i]['status-value'] == 0 && gives[i]['item'] === obj['item']) {
        connectAskGive(obj, gives[i]);
        break;
      }
    }

    console.log(
      '[DEBUG] Creating Ask ID {' + obj['id'] +
      '} containing ' + JSON.stringify(obj));

    asks.push(obj);
    return obj['id'];
  },

  // This function also fulfills the Give linked to this Ask, if any exists.
  // If the status is already fulfilled, it will not be modified, but
  // the linked Give (if any) will still be fulfilled.
  //
  // Returns:
  //   On success: New status (String)
  //   If the ID was not found: Empty string
  fulfillAskStatus: function fulfillAskStatus(requestBody) {
    var id = requestBody['id'];

    var ask = findAsk(id);
    if (ask == {}) {
      return "";
    }

    if ('give-id' in ask) {
      console.log('[DEBUG] Fulfilling linked Give with id {' + ask['give-id'] + '}')
      var give = findGive(ask['give-id']);
      give['status-value'] = requestState.length - 1; // Last value
    } else {
      console.log('[DEBUG] No linked Give')
    }

    ask['status-value'] = requestState.length - 1; // Last value
    return getStatus(ask);
  },

  addGive: function addGive(requestBody) {
    var obj = convertAskGiveBody(requestBody);

    console.log(
      '[DEBUG] Creating Give ID {' + obj['id'] +
      '} containing ' + JSON.stringify(obj));

    gives.push(obj);
    return obj['id'];
  },

  getAllAsks: function getAllAsks() {
    var asksReturn = copyJsonObject(asks);
    for (var i = 0; i < asksReturn.length; i++) {
      convertStatusValueToStatus(asksReturn[i])
    }
    return asksReturn;
  },

  getAllGives: function getAllGives() {
    var givesReturn = copyJsonObject(gives);
    for (var i = 0; i < givesReturn.length; i++) {
      convertStatusValueToStatus(givesReturn[i])
    }
    return givesReturn;
  }

};
