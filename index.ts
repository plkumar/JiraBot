/// <reference path="typings/tsd.d.ts" />

import fs = require('fs');
import restify = require('restify');
import builder = require('botbuilder');

var model = 'https://api.projectoxford.ai/luis/v1/application?id=f8f3c825-1076-4b5e-92fb-3ce751869384&subscription-key=c2ba4a70587642b7a4cada97a40584ed';
var dialog = new builder.LuisDialog(model);


// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'nzen-jirabot', appSecret: '4d5b3c579158471ab9c7e22887974455' });

bot.configure({
    userWelcomeMessage: "Hello... Welcome.",
    goodbyeMessage: "Goodbye...",
    groupWelcomeMessage : "Welcome."  
});

bot.add('/', dialog);

dialog.on('GetAllIssues', [
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        var status = builder.EntityRecognizer.findEntity(args.entities, 'issue_status');
        var type = builder.EntityRecognizer.findEntity(args.entities,'issue_type');
        var assignedTo = builder.EntityRecognizer.findEntity(args.entities,'assigned_to');
        // var alarm = session.dialogData.alarm = {
        //   title: title ? title.entity : null,
        //   timestamp: time ? time.getTime() : null  
        // };
        
        // // Prompt for title
        // if (!alarm.title) {
        //     builder.Prompts.text(session, 'What would you like to call your alarm?');
        // } else {
        //     next();
        // }
        console.log( status, type, assignedTo);
        session.endDialog('Hello World!');
    }]);

// bot.add('/', function (session) {
//     session.send('Hello World!');
// });

bot.on('DeleteUserData', function (message) {
    console.log("We shall delete user data here.");
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// enable static route for web content
server.get(/\/static\/?.*/, restify.serveStatic({
  directory: __dirname + '/public',
  default: 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});