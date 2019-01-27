const uuidv4 = require('uuid/v4');
const timestamp = require('unix-timestamp');

var asks = [];
var gives = [];

function copyJsonObject(object) {
  return JSON.parse(JSON.stringify(object));
}

const requestState = [
  'unmatched',
  'matched-new',
  'matched-inprogress',
  'fulfilled'
];

function convertAskGiveBody(requestBody) {
  var obj = { // Cloned fields from requestBody
    'user': {
      'name': requestBody['user']['name'],
      'email': requestBody['user']['email'],
      'location': requestBody['user']['location']
    },
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

function convertStatusValueToStatus(obj) {
  obj['status'] = requestState[obj['status-value']];
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
  }

};
