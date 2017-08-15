var autobahn = require('autobahn');
var db = require('./db');
var assert = require('assert');
var cleanExit = require('./cleanExit').CleanExit(exitHandler);
const wsUrl = "wss://api.poloniex.com";
const dbUrl = 'mongodb://localhost:27017/poloniex-data';

// Ensure mongo closes correctly on exit
function exitHandler() {
  db.close();
  process.exit();
}

// Declare web socket to polo
var connection = new autobahn.Connection({
  url: wsUrl,
  realm: "realm1"
});

// Open mongo connection. If successful open polo connection
db.connect(dbUrl, function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.');
    process.exit(1);
  } else {
    console.log('Connected to Mongo');
    connection.open();
  }
});

connection.onopen = function (session) {
  function tickerEvent (args,kwargs) {
    insertTickerLine(args);
  }
  function trollboxEvent (args,kwargs) {
    insertTrollboxLine(args);
  }
  session.subscribe('ticker', tickerEvent);
  // Trollbox now deprecated :(
  //session.subscribe('trollbox', trollboxEvent);
}

connection.onclose = function () {
  console.log("Websocket connection closed");
}

// Insert trollbox data from polo web socket into mongo
var insertTrollboxLine = function(data) {
  var collection = db.get().collection('trollbox');
  collection.insertOne({
    msgNo: data[1],
    time: Date.now(),
    user: data[2],
    text: data[3],
    reputation: data[4]
  }, function(err, result){
    if (err){
      console.log(err);
    } else {
      console.log("Inserted a line into trollbox collection");
    }
  });
}

// Insert ticker data from polo web socket into mongo
var insertTickerLine = function(data) {
  var collection = db.get().collection('ticker');
  collection.insertOne({
    currencyPair: data[0],
    last: data[1],
    lowestAsk: data[2],
    highestBid: data[3],
    percentChange: data[4],
    baseVolume: data[5],
    quoteVolume: data[6],
    isFrozen: data[7],
    hr24High: data[8],
    hr24Low: data[9],
    time: Date.now()
  }, function(err, result){
    if (err){
      console.log(err);
    } else {
      console.log("Inserted a line into ticker collection");
    }
  });
}
