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

module.exports = {

  addAsk: function addAsk(requestBody) {
    var obj = convertAskGiveBody(requestBody);

    console.log(
      '[DEBUG] Creating Ask ID {' + obj['id'] +
      '} containing ' + JSON.stringify(obj));

    asks.push(obj);
    return obj['id'];
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
  },

  // This function also fulfills the Ask linked to this Give, if any exists.
  // If the status is already fulfilled, it will not be modified, but
  // the linked Ask (if any) will still be fulfilled.
  //
  // Returns:
  //   On success: New status (String)
  //   If the ID was not found: Empty string
  fulfillGiveStatus: function fulfillGiveStatus(requestBody) {
    var id = requestBody['id'];

    var give = findGive(id);
    if (give == {}) {
      return "";
    }

    if ('ask-id' in give) {
      console.log('[DEBUG] Fulfilling linked Ask with id {' + give['ask-id'] + '}')
      var ask = findAsk(give['ask-id']);
      ask['status-value'] = requestState.length-1;  // Last value
    }
    else {
      console.log('[DEBUG] No linked Ask')
    }

    give['status-value'] = requestState.length-1;  // Last value
    return getStatus(give);
  }

};
