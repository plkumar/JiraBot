/// <reference path="typings/tsd.d.ts" />
"use strict";
const restify = require('restify');
const builder = require('botbuilder');
const JiraApi = require('jira').JiraApi;
var config = {
    host: "jira.allianceglobalservices.com",
    port: "80",
    user: "lpeethani",
    password: "Hasini12$"
};
var jira = new JiraApi('http', config.host, config.port, config.user, config.password, '2');
var luisAppId = "f8f3c825-1076-4b5e-92fb-3ce751869384";
var luisSubscriptionKey = "c2ba4a70587642b7a4cada97a40584ed";
var model = `https://api.projectoxford.ai/luis/v1/application?id=${luisAppId}&subscription-key=${luisSubscriptionKey}`;
var dialog = new builder.LuisDialog(model);
// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'nzen-jirabot', appSecret: '4d5b3c579158471ab9c7e22887974455' });
bot.configure({
    userWelcomeMessage: "Hello... Welcome.",
    goodbyeMessage: "Goodbye...",
    groupWelcomeMessage: "Welcome."
});
bot.add('/', dialog);
dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand."));
dialog.on('GetProjects', [function (session, args, next) {
        if (args.entities.length > 0) {
            next();
        }
        else {
            jira.listProjects(function (error, result) {
                //console.log("project", result);
                var projects = [];
                result.forEach((item) => {
                    projects.push(`[${item.key}] - ${item.name}`);
                });
                session.dialogData.projects = projects;
                builder.Prompts.choice(session, "Choose project of your choice?", projects);
            });
        }
    },
    function (session, results, next) {
        console.log(results);
        session.send("Changing project to " + results.response.entity);
        next();
    },
    function (session, args) {
        //session.send("you've chosen", args);
        session.endDialog("bye");
    }]);
dialog.on('GetAllIssues', [
    function (session, args, next) {
        // Resolve and store any entities passed from LUIS.
        var status = builder.EntityRecognizer.findEntity(args.entities, 'issue_status');
        var type = builder.EntityRecognizer.findEntity(args.entities, 'issue_type');
        var assignedTo = builder.EntityRecognizer.findEntity(args.entities, 'assigned_to');
        var query = session.dialogData.query = {
            status: status ? status.entity : null,
            type: type ? type.entity : null,
            assignedTo: assignedTo ? assignedTo.entity : null
        };
        // // Prompt for title
        if (!query.type) {
            builder.Prompts.text(session, 'What would you like to call your alarm?');
        }
        else {
            next();
        }
        console.log(status, type, assignedTo);
        //session.endDialog('Hello World!');
    },
    function (session, results, next) {
        console.log(results);
    },
    function (session, results) {
        session.send("in next");
    }
]);
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
//# sourceMappingURL=index.js.map