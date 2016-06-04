"use strict";
const builder = require('botbuilder');
class IssueHandler {
    constructor(dialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }
    attachHandler() {
        var that = this;
        this._dialog.on("ShowIssue", [function (session, args, next) {
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
                    that._jira.findIssue(issueNumber, function (error, issue) {
                        session.send(`Issue# ${issueNumber}
    Summary : ${issue.fields.summary}
    Status : ${issue.fields.status.name}`);
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