const uuidv4 = require('uuid/v4');
const timestamp = require('unix-timestamp');

let asks = [];
let gives = [];

function copyJsonObject(object) {
  return JSON.parse(JSON.stringify(object));
}

function isEmpty(object) {
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

const requestState = [
  'unmatched',
  'matched',
  'fulfilled'
];

function findAsk(id) {
  for (let i = 0; i < asks.length; i++) {
    if (id === asks[i]['id']) {
      return asks[i];
    }
  }
  return {};
}

function findGive(id) {
  for (let i = 0; i < gives.length; i++) {
    if (id === gives[i]['id']) {
      return gives[i];
    }
  }
  return {};
}

function convertAskGiveBody(requestBody) {
  let obj = { // Cloned fields from requestBody
    'user_name': requestBody['user_name'],
    'user_email': requestBody['user_email'],
    'user_location': requestBody['user_location'],
    'item': requestBody['item'],
    'quantity': requestBody['quantity']
  }

  // Additional fields
  let id = uuidv4();
  obj['id'] = id;
  obj['posted'] = timestamp.now();
  obj['status_value'] = 0;

  return obj;
};

function getStatus(obj) {
  return requestState[obj['status_value']];
}

function convertStatusValueToStatus(obj) {
  obj['status'] = getStatus(obj);
  delete obj['status_value'];
}

function connectAskGive(ask, give) {
  give['status_value']++;
  give['match_id'] = ask['id'];
  give['match_name'] = ask['user_name']
  give['match_email'] = ask['user_email']
  give['match_location'] = ask['user_location']

  ask['status_value']++;
  ask['match_id'] = give['id']
  ask['match_name'] = give['user_name']
  ask['match_email'] = give['user_email']
  ask['match_location'] = give['user_location']

  console.log(
    '[DEBUG] Connected corresponding unmatched Give with id {' +
    give['id'] + '} to this Ask');
}

module.exports = {

  addAsk: function addAsk(requestBody) {
    let obj = convertAskGiveBody(requestBody);

    // Optional matching
    for (let i = 0; i < gives.length; i++) {
      // First unmatched Give which has the same item
      if (gives[i]['status_value'] == 0 && gives[i]['item'] === obj['item']) {
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
    let id = requestBody['id'];

    let ask = findAsk(id);
    if (isEmpty(ask)) {
      return "";
    }

    if ('match_id' in ask) {
      console.log('[DEBUG] Fulfilling linked Give with id {' + ask['match_id'] + '}')
      let give = findGive(ask['match_id']);
      give['status_value'] = requestState.length - 1; // Last value
    } else {
      console.log('[DEBUG] No linked Give')
    }

    ask['status_value'] = requestState.length - 1; // Last value
    return getStatus(ask);
  },

  addGive: function addGive(requestBody) {
    let obj = convertAskGiveBody(requestBody);

    console.log(
      '[DEBUG] Creating Give ID {' + obj['id'] +
      '} containing ' + JSON.stringify(obj));

    gives.push(obj);
    return obj['id'];
  },

  getAllAsks: function getAllAsks() {
    let asksReturn = copyJsonObject(asks);
    for (let i = 0; i < asksReturn.length; i++) {
      convertStatusValueToStatus(asksReturn[i])
    }
    return asksReturn;
  },

  getAllGives: function getAllGives() {
    let givesReturn = copyJsonObject(gives);
    for (let i = 0; i < givesReturn.length; i++) {
      convertStatusValueToStatus(givesReturn[i])
    }
    return givesReturn;
  },

  clearAll: function clearAll() {
    asks = [];
    gives = [];
  }

};
