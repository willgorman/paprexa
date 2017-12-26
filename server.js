var express = require("express"),
  alexa = require("alexa-app"),
  request = require("request-promise"),
  uuid = require('uuid/v4'),
  BASE_URL = 'https://api.forecast.io/forecast/' + process.env.WEATHER_API_KEY + '/38.9649734,-77.0207249', // Using coordinates of Washington DC, replace with your own or a lookup for an Alexa user's address
  PORT = process.env.PORT || 3000,
  app = express(),
  // Setup the alexa app and attach it to express before anything else.
  alexaApp = new alexa.app("paprika");


const zlib = require('zlib');

// POST calls to / in express will be handled by the app.request() function
alexaApp.express({
  expressApp: app,
  checkCert: true,
  // sets up a GET route when set to true. This is handy for testing in
  // development, but not recommended for production.
  debug: true
});

app.set("view engine", "ejs");

alexaApp.launch(function (request, response) {
  console.log("App launched");
  response.say('I can tell you the weather<break time="1s"/> but you must give me a day!');
});

// The main Weather intent - checks if a day/date was supplied or not and sends the appropriate response
alexaApp.intent("AddItem", {
    "slots": {
      "item": "AMAZON.Food"
    },
    "utterances": [
    ]
  },
  function (request, response) {
    console.log("In AddItem intent");
    if (request.data.request.intent.slots.item &&
      request.data.request.intent.slots.item.value) {
      console.log(request.data.request.intent.slots.item.value)
      return postItem(request.data.request.intent.slots.item.value, response)
    } else {
      console.log('Responding to request with no ditem');
      response.say('I\'m not sure what item you want to add to your list');
    }
  }
);

alexaApp.intent("AMAZON.CancelIntent", {
  "slots": {},
  "utterances": []
}, function (request, response) {
  console.log("Sent cancel response");
  response.say("Ok, sure thing");
  return;
});

alexaApp.intent("AMAZON.StopIntent", {
  "slots": {},
  "utterances": []
}, function (request, response) {
  console.log("Sent stop response");
  response.say("Alright, I'll stop");
  return;
});

alexaApp.sessionEnded(function (request, response) {
  console.log("In sessionEnded");
  console.error('Alexa ended the session due to an error');
  // no response required
});

function postItem(item, response) {
  var g = [{
    "uid": uuid(),
    "name": item,
    "purchased": 0,
    "order_flag": 19,
    "recipe": "",
    "aisle": "Unknown",
    "deleted": false
  }]

  console.log("adding item")
  var result = zlib.gzipSync(JSON.stringify(g));

  var uri = 'https://www.paprikaapp.com/api/v1/sync/groceries/';
  return request.post({
    'uri': uri,
    'auth': {
      'user': process.env.PAPRIKA_USER,
      'pass': process.env.PAPRIKA_PASSWORD,
      'sendImmediately': true
    },
    headers: {
      'Content-Encoding': 'gzip'
    },
    formData: {
      data: {
        value: result,
        options: {
          filename: 'file',
          contentType: 'application/octet-stream'
        }
      }
    }

  }).then(function (body) {
    console.log("yes?")
    console.log(body)
    response.say("I've added " + item + " to your list")
  }).catch(function (err) {
    console.log(err)
  });

};


app.listen(PORT, () => console.log("Listening on port " + PORT + "."));