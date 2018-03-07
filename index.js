/* eslint-disable  func-names */
'use strict';

const Alexa = require('alexa-sdk');
const http = require('http');
const request = require('request');
const APP_ID = 'amzn1.ask.skill.01958c34-3383-40fd-8edb-c52a73e1d14e';
const API = 'http://nodejs-mongo-persistent-islandescape.1d35.starter-us-east-1.openshiftapps.com/api/char/';
var amazonID = '';

const SKILL_NAME = 'Der Fluch des Wasserdrachen';
const HELP_MESSAGE = 'Du kannst fragen, wohin du gehen kannst oder du kannst das Spiel verlassen. Womit kann ich dir helfen?';
const HELP_REPROMPT = 'Womit kann ich dir helfen?';
const STOP_MESSAGE = 'Auf Wiedersehen!';

const handlers = {
    'LaunchRequest': function () {
        this.emit(':tell', 'Willkommen im Fluch des Wasserdrachen!');
    },
    'startGame' : function () {
      var handl = this;
      getIntent().then(function(response){
        handl.emit(':tell', response.toString());
      }, function(error) {
        handl.emit(':tell', error.toString());
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

function url(aID) {
  if (aID == true) {
    return API + amazonID;
  } else {
    return API;
  }
}


//CRUD functions for communicating with DB

//creating a new character with the user_id as owner
function postCharacter() {
  request.post(url(false)).form({owner: amazonID});
}

//requesting the character of a user with a specific user_id from the db
function getCharacter(callback) {
  request.get(url(true), function(err, response, body) {
      var d = JSON.parse(body);
      if (d != null) {
        callback(d.owner);
      } else {
          callback ("Nothing found");
      }
    if (err) callback("ERROR");
  });
}

//updating an existing character
function putCharacter(newLvl) {
  request.put(url(true)).form({newLevel: newLvl});
}

//deleting an existing character
function deleteCharacter() {
  request.delete(url(true));
}

/*
checking if an user_id is already linked to a character.
If yes, the characters JSON is returned. If no, a new character is being created
*/
function getIntent (){
  return new Promise(function(resolve, reject) {
    getCharacter(function (data) {
      if (data == "ERROR") {
        resolve('Da ist wohl etwas schief gegangen.');
      } else if (data != "Nothing found") {
        resolve(data);
      } else {
        postCharacter();
        resolve('Für dich wurde ein neuer Charakter erstellt!');
      }
    });
  });
}


exports.handler = function (event, context, callback) {
    amazonID = event.session.user.userId;
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
