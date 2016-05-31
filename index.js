/// <reference path="typings/tsd.d.ts" />
"use strict";
const restify = require('restify');
const builder = require('botbuilder');
const _ = require('lodash');
const JiraQueryBuilder = require('./lib/JiraQueryBuilder');
const JiraApi = require('jira').JiraApi;
var config = require("./config.json");
var jira = new JiraApi('http', config.jira.host, config.jira.port, config.jira.user, config.jira.password, '2');
var model = `https://api.projectoxford.ai/luis/v1/application?id=${config.luis.luisAppId}&subscription-key=${config.luis.luisSubscriptionKey}`;
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
dialog.on("GreetUser", [function (session, results) {
        session.send("Hello, i'm Jira Bot, how can i help you today?");
    }]);
dialog.on("HelpMe", [function (session, result) {
        session.send(`
    you can say:
    list projects
    show projects
    add comment on JIRA-1234
    `);
    }]);
dialog.on("LogWork", [function (session, args, next) {
        var issueNumber = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');
        var duration = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.duration');
        var logWorkObject = session.dialogData.logWorkObject = {
            issueNumber: issueNumber ? issueNumber.entity : session.dialogData.issueNumber ? session.dialogData.issueNumber : null,
            duration: duration ? duration.resolution.duration : null
        };
        if (!logWorkObject.issueNumber) {
            builder.Prompts.text(session, "Please enter an issue number.");
        }
        else if (!logWorkObject.duration) {
            builder.Prompts.text(session, "enter duration.");
        }
        else {
            next();
        }
    }, function (session, results, next) {
        next();
    }, function (session, results) {
        session.send(`logging ${session.dialogData.logWorkObject.duration} on issue # ${session.dialogData.logWorkObject.issueNumber}`);
    }]);
dialog.on("AddComment", [function (session, args, next) {
        var issueNumber = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');
        var commentText = builder.EntityRecognizer.findEntity(args.entities, 'comment_text');
        var commentObject = session.dialogData.commentObject = {
            issueNumber: issueNumber ? issueNumber.entity : session.dialogData.issueNumber ? session.dialogData.issueNumber : null,
            commentText: commentText ? commentText.entity : null
        };
        if (!commentObject.issueNumber) {
            builder.Prompts.text(session, "Enter issue number");
        }
        else {
            next();
        }
    }, function (session, results, next) {
        //console.log(results.response);
        var commentObject = session.dialogData.commentObject;
        if (results.response) {
            commentObject.issueNumber = results.response;
        }
        if (!commentObject.commentText) {
            builder.Prompts.text(session, "Enter comment text.");
        }
        else {
            next();
        }
    }, function (session, results) {
        //console.log(results.response);
        var commentObject = session.dialogData.commentObject;
        if (results.response) {
            commentObject.commentText = results.response;
        }
        if (commentObject.issueNumber && commentObject.commentText) {
            session.send(`creating comment on issue ${commentObject.issueNumber} text: ${commentObject.commentText}`);
        }
        else {
            session.send("Not sure what to do.");
        }
    }]);
dialog.on("ShowIssue", [function (session, args, next) {
        var issue = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');
        var issueNumber = session.dialogData.issueNumber = issue.entity;
        if (!issueNumber) {
            builder.Prompts.text(session, "Enter issue number.");
        }
        else {
            next({ "response": issueNumber });
        }
    }, function (session, results) {
        if (results.response) {
            var issueNumber = results.response;
            while (issueNumber.indexOf(' ') > 0) {
                issueNumber = issueNumber.replace(' ', '');
            }
            issueNumber = session.dialogData.issueNumber = issueNumber;
            jira.findIssue(issueNumber, function (error, issue) {
                session.send(`Issue ${issueNumber}
            Summary ${issue.fields.summary}
            Status ${issue.fields.status.name}`);
            });
        }
        else {
            session.send("not able to get issue number.");
        }
    }]);
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
    }, function (session, results) {
        console.log(results);
        session.send(`Changing project to ${results.response.entity}`);
    }]);
dialog.on('GetAllIssues', function (session, args) {
    // Resolve and store any entities passed from LUIS.
    var status = builder.EntityRecognizer.findEntity(args.entities, 'issue_status');
    var type = builder.EntityRecognizer.findEntity(args.entities, 'issue_type');
    var assignedTo = builder.EntityRecognizer.findEntity(args.entities, 'assigned_to');
    var query = session.dialogData.query = {
        status: status ? status.entity : null,
        type: type ? type.entity : null,
        assignedTo: assignedTo ? assignedTo.entity : null
    };
    var jsearch = new JiraQueryBuilder();
    if (query.type)
        jsearch.where("issueType", _.capitalize(query.type));
    if (query.status)
        jsearch.where("status", _.capitalize(query.status));
    if (query.assignedTo) {
        if (query.assignedTo == "my" || query.assignedTo == "me") {
            jsearch.where("assignee", "currentUser()");
        }
        else {
            jsearch.where("assignee", query.assignedTo);
        }
    }
    var jqlquery = jsearch.query();
    jira.searchJira(jqlquery, null, (error, data) => {
        if (error) {
            session.send("Error querying jira");
        }
        var issueList = "";
        _.forEach(data.issues, (issue) => {
            issueList = `${issueList}\n${issue.key} :: ${issue.fields.summary}\n`;
        });
        session.send(issueList);
    });
    //session.send(`searching for issues with status ${query.status}, of type ${query.type} and assigned to ${query.assignedTo}`);
    //console.log(status, type, assignedTo);
});
function getRecognizedPhrase(text) {
    var rItems = [];
    _.forEach(config.phraseList, (item) => {
        if (_.isMatch(item, { 'phrases': [_.lowerCase(text)] })) {
            rItems.push({ 'key': item.key, 'value': item.value });
        }
    });
    return _.head(rItems);
}
console.log(getRecognizedPhrase("Defects"));
bot.on('DeleteUserData', function (message) {
    console.log("We shall delete user data here.");
});
// Setup Restify Server
var server = restify.createServer({
    name: "JiraBot"
});
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
// enable static route for web content
server.get(/\/static\/?.*/, restify.serveStatic({
    directory: `${__dirname}/public`,
    default: 'index.html'
}));
server.listen(process.env.port || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
//# sourceMappingURL=index.js.map