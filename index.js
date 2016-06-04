/// <reference path="typings/tsd.d.ts" />
"use strict";
const restify = require('restify');
const builder = require('botbuilder');
const JiraApi = require('jira').JiraApi;
var config = require("./config.json");
var jira = new JiraApi('http', config.jira.host, config.jira.port, config.jira.user, config.jira.password, '2');
var model = `https://api.projectoxford.ai/luis/v1/application?id=${config.luis.luisAppId}&subscription-key=${config.luis.luisSubscriptionKey}`;
var dialog = new builder.LuisDialog(model);
// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: config.botConnector.appId, appSecret: config.botConnector.appSecret });
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
const ProjectHandler = require('./lib/ProjectHandler');
var projectHandler = new ProjectHandler(dialog, jira);
projectHandler.attachHandler();
const LogWorkHandler = require('./lib/LogWorkHandler');
var logWorkHandler = new LogWorkHandler(dialog, jira);
logWorkHandler.attachHandler();
const SearchIssuesHandler = require('./lib/SearchIssuesHandler');
var searchHandler = new SearchIssuesHandler(dialog, jira);
searchHandler.attachHandler();
const IssueHandler = require('./lib/IssueHandler');
var issueHandler = new IssueHandler(dialog, jira);
issueHandler.attachHandler();
const IssueCommentsHandler = require('./lib/IssueCommentHandler');
var commentHandler = new IssueCommentsHandler(dialog, jira);
commentHandler.attachHandler();
// function getRecognizedPhrase(text) {
//         var rItems =[]
//         _.forEach(config.phraseList, (item) => {
//                 if (_.isMatch(item, { 'phrases': [_.lowerCase(text)] })) {
//                         rItems.push( { 'key': item.key, 'value': item.value });
//                 }
//         });
//         return _.head(rItems);
// }
// console.log(getRecognizedPhrase("Defects"));
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