import builder = require('botbuilder');
import JiraQueryBuilder = require('./JiraQueryBuilder');
import _ = require('lodash');

class IssueHandler implements IJiraBotHandler {

    _dialog: builder.LuisDialog;
    _jira: any;

    constructor(dialog: builder.LuisDialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }

    attachHandler() {
        var that = this;
        this._dialog.on("ShowIssue", [function (session, args: luis.LUISResponse, next) {
            var issue = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');

            var issueNumber = session.dialogData.issueNumber = issue.entity;
            if (!issueNumber) {
                builder.Prompts.text(session, "Enter issue number.")
            } else {
                next({ "response": issueNumber });
            }
        }, function (session, results) {
            if (results.response) {
                var issueNumber = results.response;
                while (issueNumber.indexOf(' ') > 0) {
                    issueNumber = issueNumber.replace(' ', '')
                }
                issueNumber = session.dialogData.issueNumber = issueNumber;

                that._jira.findIssue(issueNumber, function (error, issue) {
                    session.send(`Issue# ${issueNumber}
    Summary : ${issue.fields.summary}
    Status : ${issue.fields.status.name}`)
                });
            } else {
                session.send("not able to get issue number.");
            }
        }]);
    }
}

export = IssueHandler;