// server.js
// where your node app starts

// init project
var express = require('express');
var req = require('request');
var pako = require('pako');
var uuid = require('uuid/v4')
var app = express();
//require('request-debug')(req);
const zlib = require('zlib');

req.debug = true
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});

app.get("/groceries", function (request, response) {
  var callback = function (err, res, body) {
    response.set('Content-Type', 'application/json');
    response.send(body);
    
  }
  req.get({
    'uri': 'https://www.paprikaapp.com/api/v1/sync/groceries/',
    'auth': {
      'user': process.env.PAPRIKA_USER,
      'pass': process.env.PAPRIKA_PASSWORD,
      'sendImmediately': true
    }
  }, callback);
});

function gunzipJSON(response){

    var gunzip = zlib.createUnzip();
    var json = "";

    gunzip.on('data', function(data){
        console.log(data.toString());
        json += data.toString();
    });

    gunzip.on('end', function(){
        JSON.parse(json);
    });

    response.pipe(gunzip);
}
app.post("/groceries", function(request, response) {
  var callback = function (err, res, body) {
    //zlib.gunzip(body, function(error, result){
     // console.log(typeof body)
     // console.log(error)
     // response.send(res);
    //});
    response.send(res)
  }
  var f = [{"aisle": "Produce", "uid": "4ECACFA2-16CA-40AB-98AC-664CAB368449-1752-000001AA116CED6E", "order_flag": 0, "recipe": "Tomato Margherita Pasta", "name": "2 cups baby arugula", "purchased": false, "recipe_uid": null, "ingredient": "baby arugula"}]
  var g = [{"uid":"7ad4ae86-3211-491e-8d84-5d4bb6a0ac12","name":"2 large eggplants","purchased":0,"order_flag":19,"recipe":"","aisle":"Produce","ingredient":"eggplant","deleted":false}]
  //var deflate = new pako.Deflate({ level: 3});
  //deflate.push(f, true);
  //var buffer = new Buffer(deflate.result);
  
  zlib.gzip(JSON.stringify(g), function (error, result) {
   if (error) throw error;
     console.log(result);
     console.log("UUUUUUUH");
     var formData = {
      data: result,
     };

  
  req.post({
    'uri': 'https://www.paprikaapp.com/api/v1/sync/groceries/',
    'auth': {
      'user': process.env.PAPRIKA_USER,
      'pass': process.env.PAPRIKA_PASSWORD,
      'sendImmediately': true
    },
    formData: formData,
    headers: {'Content-Encoding': 'gzip'}

  }, callback);
})
  
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
