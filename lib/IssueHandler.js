"use strict";
const builder = require('botbuilder');
var config = require("../config.json");
class IssueHandler {
    constructor(dialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }
    formatPrintIssue(issue) {
        return `Issue# [**${issue.key}**](http://${config.jira.host}/browse/${issue.key})
Summary : ${issue.fields.summary}
Status : *${issue.fields.status.name}*`;
    }
    attachHandler() {
        var that = this;
        this._dialog.on("ShowIssue", [function (session, args, next) {
                var issue = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');
                if (!issue) {
                    builder.Prompts.text(session, ["Enter issue number.", "Please specify the issue number."]);
                }
                else {
                    var issueNumber = issue.entity;
                    next({ "response": issueNumber });
                }
            }, function (session, results) {
                if (results.response) {
                    var issueNumber = results.response;
                    while (issueNumber.indexOf(' ') > 0) {
                        issueNumber = issueNumber.replace(' ', '');
                    }
                    issueNumber = session.dialogData.issueNumber = issueNumber;
                    that._jira.findIssue(issueNumber, function (error, issue) {
                        if (!error) {
                            session.send(that.formatPrintIssue(issue));
                        }
                        else {
                            session.send(`Error ${error}`);
                        }
                    });
                }
                else {
                    session.send("not able to get issue number.");
                }
            }]);
    }
}
module.exports = IssueHandler;
//# sourceMappingURL=IssueHandler.js.map