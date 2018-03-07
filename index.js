/* eslint-disable  func-names */
'use strict';

const Alexa = require('alexa-sdk');
const http = require('http');
const request = require('request');
const APP_ID = 'amzn1.ask.skill.01958c34-3383-40fd-8edb-c52a73e1d14e';
const API = 'http://nodejs-mongo-persistent-islandescape.1d35.starter-us-east-1.openshiftapps.com/api/char/';
var amazonID = 'testUser';

const SKILL_NAME = 'Der Fluch des Wasserdrachen';
const HELP_MESSAGE = 'Du kannst fragen, wohin du gehen kannst oder du kannst das Spiel verlassen. Womit kann ich dir helfen?';
const HELP_REPROMPT = 'Womit kann ich dir helfen?';
const STOP_MESSAGE = 'Auf Wiedersehen!';

const handlers = {
    'LaunchRequest': function () {
        this.emit(':tell', 'Willkommen im Fluch des Wasserdrachen!');
    },
    'startGame' : function () {

      getIntent().then(function(response){
        this.emit( ':tell', response);
      }, function(error) {
        this.emit( ':tell', error);
      });
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

function url() {
    return API + amazonID;
}

function getJSON(callback) {

    request.get(url(), function(err, response, body) {
        var d = JSON.parse(body);
        if (d != null) {
          callback(d.owner);
        } else {
            callback ("ERROR");
        }
      if (err) callback("ERROR");
    });
}

function getIntent (){
    return new Promise(function(resolve, reject) {
      getJSON(function (data) {
        if (data != "ERROR") {
          resolve(data);
        } else {
          resolve('Keine Daten gefunden.');
        }
      });
    });
  }


exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
