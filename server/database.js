const uuidv4 = require('uuid/v4');

var asks = [];

module.exports = {
  addAsk: function addAsk(requestBody) {
    var id = uuidv4();
    var obj = {
      'id': id,
      'seeker': {
        'name': requestBody['seeker']['name'],
        'email': requestBody['seeker']['email'],
      },
      'item': requestBody['item'],
      'quantity': requestBody['quantity']
    }

    console.log('[DEBUG] Ask ID {' + id + '} containing ' + obj);

    asks.push(obj);
    return id;
  }
};
