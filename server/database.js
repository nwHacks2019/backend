const uuidv4 = require('uuid/v4');
const timestamp = require('unix-timestamp');

var asks = [];

module.exports = {
  addAsk: function addAsk(requestBody) {
    var obj = { // Cloned fields from requestBody
      'seeker': {
        'name': requestBody['seeker']['name'],
        'email': requestBody['seeker']['email'],
      },
      'item': requestBody['item'],
      'quantity': requestBody['quantity']
    }

    // Additional fields
    var id = uuidv4();
    obj['id'] = id;
    obj['posted'] = timestamp.now();

    console.log(
      '[DEBUG] Creating Ask ID {' + id +
      '} containing ' + JSON.stringify(obj));

    asks.push(obj);
    return id;
  },

  getAllAsks: function getAllAsks() {
    return asks;
  }
};
