var express = require("express"),
    alexa = require("alexa-app"),
    request = require("request"),
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

alexaApp.launch(function(request, response) {
  console.log("App launched");
  response.say('I can tell you the weather<break time="1s"/> but you must give me a day!');
});

// The main Weather intent - checks if a day/date was supplied or not and sends the appropriate response
alexaApp.intent("AddItem", {
    "slots": { "item": "AMAZON.Food" },
    "utterances": [
      "what's the weather for {WHEN}",
      "what I should expect on {WHEN}",
      "tell me the weather",
      "{WHEN}"
    ]
  },
  function(request, response) {
    console.log("In AddItem intent");
    // If the requester specified a date/day
    if (request.data.request.intent.slots.item &&
        request.data.request.intent.slots.item.value) {
        // Request the weather - we're using Promises to delay the response until we have data back from forecast.io
        return postItem(request.data.request.intent.slots.item.value)
          .then(function (weather) {
            console.log('Responding to weather request for ' + request.data.request.intent.slots.WHEN.value + ' with:', weather);
            response.say(weather);
          })
          .catch(function(err){
            response.say(err);
          });
    } else {
      // If the requester didn't specify a date/day
      console.log('Responding to weather request with no day/date');
      response.say('I can tell you the weather<break time="1s"/> but you must give me a day');
    }
  }
);

alexaApp.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    console.log("Sent cancel response");
  	response.say("Ok, sure thing");
  	return;
  }
);

alexaApp.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    console.log("Sent stop response");
  	response.say("Alright, I'll stop");
  	return;
  }
);

alexaApp.sessionEnded(function(request, response) {
  console.log("In sessionEnded");
  console.error('Alexa ended the session due to an error');
  // no response required
});






function postItem(item) {
  var callback = function (err, res, body) {
    // response.send(res)
  }
  var f = [{"aisle": "Produce", "uid": "4ECACFA2-16CA-40AB-98AC-664CAB368449-1752-000001AA116CED6E", "order_flag": 0, "recipe": "Tomato Margherita Pasta", "name": "2 cups baby arugula", "purchased": false, "recipe_uid": null, "ingredient": "baby arugula"}]
  var g = [{"uid":"7ad4ae86-3211-491e-8d84-5d4bb6a0ac12","name":"2 large eggplants","purchased":0,"order_flag":19,"recipe":"","aisle":"Produce","ingredient":"eggplant","deleted":false}]

  
  zlib.gzip(JSON.stringify(g), function (error, result) {
   if (error) throw error;


  var uri = 'https://www.paprikaapp.com/api/v1/sync/groceries/';
  var postreq = request.post({
    'uri': uri,
    'auth': {
      'user': process.env.PAPRIKA_USER,
      'pass': process.env.PAPRIKA_PASSWORD,
      'sendImmediately': true
    },
    headers: {
      'Content-Encoding': 'gzip'
    }

  }, callback);
  var form = postreq.form();
  form.append('data', result, {
    filename: 'file',
    contentType: 'application/octet-stream'
  });
})
  
};


app.listen(PORT, () => console.log("Listening on port " + PORT + "."));