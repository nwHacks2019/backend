const uuidv4 = require('uuid/v4');
const timestamp = require('unix-timestamp');

var asks = [];
var gives = [];

function convertAskGiveBody(requestBody) {
  var obj = { // Cloned fields from requestBody
    'user': {
      'name': requestBody['user']['name'],
      'email': requestBody['user']['email'],
    },
    'item': requestBody['item'],
    'quantity': requestBody['quantity']
  }

  // Additional fields
  var id = uuidv4();
  obj['id'] = id;
  obj['posted'] = timestamp.now();

  return obj;
};

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
    return asks;
  },

  getAllGives: function getAllGives() {
    return gives;
  }

};
