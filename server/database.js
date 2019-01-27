const uuidv4 = require('uuid/v4');
const timestamp = require('unix-timestamp');

var asks = [];
var seeks = [];

function convertAskSeekBody(requestBody) {
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
    var obj = convertAskSeekBody(requestBody);

    console.log(
      '[DEBUG] Creating Ask ID {' + obj['id'] +
      '} containing ' + JSON.stringify(obj));

    asks.push(obj);
    return obj['id'];
  },

  addSeek: function addSeek(requestBody) {
    var obj = convertAskSeekBody(requestBody);

    console.log(
      '[DEBUG] Creating Seek ID {' + obj['id'] +
      '} containing ' + JSON.stringify(obj));

    seeks.push(obj);
    return obj['id'];
  },

  getAllAsks: function getAllAsks() {
    return asks;
  },

  getAllSeeks: function getAllSeeks() {
    return seeks;
  }

};
