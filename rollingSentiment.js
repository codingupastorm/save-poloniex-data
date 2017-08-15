// This will display a rolling sentiment for the past 2 minutes for
// a particular coin based on comments in the trollbox
var autobahn = require('autobahn');
var assert = require('assert');
var sentiment = require('sentiment');
var wsuri = "wss://api.poloniex.com";
const coins = ['XRP'] //['BTC', 'XRP', 'ETH', 'XMR', 'ETC'];
const coinRegex = ['/.[xX][rR][pP]./'];
const customSentimentScores = {
  'buy': 2,
  'sell': -2,
  'pump': 1,
  'dump': -1
};
var coinScores = [];

var connection = new autobahn.Connection({
  url: wsuri,
  realm: "realm1"
});

connection.onopen = function (session) {
  console.log('connection opened');

  function trollboxEvent (args,kwargs) {
    var text = args[3];
    var patt = new RegExp(/.[xX][rR][pP]./);
    if (patt.test(text)){
      var sentiment = sentiment(text, customSentimentScores).score;
      coinScores.push(sentiment);
      updateConsole();
      setTimeout(removeOneCoinScore, 120000); //remove after 2 mins
    }
  }

  session.subscribe('trollbox', trollboxEvent);
}

connection.onclose = function () {
  console.log("Websocket connection closed");
}

function removeOneCoinScore(){
  coinScores.shift();
}

function updateConsole(){
  var sum = 0;
  for(var i=0; i<coinScores.length; i++){
    sum += coinScores[i];
  }
  var mean = sum / coinScores.length;
  console.log('XRP Rolling Sum: ' + sum + '. XRP Rolling Mean: ' + mean);
}

connection.open();
