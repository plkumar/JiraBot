import builder = require('botbuilder');
import JiraQueryBuilder = require('./JiraQueryBuilder');
import _ = require('lodash');
var config = require("../config.json");

class IssueHandler implements IJiraBotHandler {

    _dialog: builder.LuisDialog;
    _jira: any;

    constructor(dialog: builder.LuisDialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }
    
    formatPrintIssue (issue:any) : String {
        return `Issue# [**${issue.key}**](http://${config.jira.host}/browse/${issue.key})
Summary : ${issue.fields.summary}
Status : *${issue.fields.status.name}*`
    }

    attachHandler() {
        var that = this;
        this._dialog.on("ShowIssue", [function (session, args: luis.LUISResponse, next) {
            var issue = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');

            if (!issue) {
                builder.Prompts.text(session, ["Enter issue number.", "Please specify the issue number." ])
            } else {
                var issueNumber = issue.entity;
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
                    if(!error)
                    {
                    session.send(that.formatPrintIssue(issue))
                    }else {
                        session.send(`Error ${error}`);
                    }
                });
                
            } else {
                session.send("not able to get issue number.");
            }
        }]);
    }
}

export = IssueHandler;