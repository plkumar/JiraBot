"use strict";
const builder = require("botbuilder");
const JiraQueryBuilder = require("./JiraQueryBuilder");
const _ = require("lodash");
const config = require("../config.json");
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
        const that = this;
        this._dialog.on("ShowIssue", [function (session, args, next) {
                let issue = builder.EntityRecognizer.findEntity(args.entities, "issue_number");
                if (!issue) {
                    builder.Prompts.text(session, ["Enter issue number.", "Please specify the issue number."]);
                }
                else {
                    let issueNumber = issue.entity;
                    next({ "response": issueNumber });
                }
            }, function (session, results) {
                if (results.response) {
                    let issueNumber = results.response;
                    while (issueNumber.indexOf(" ") > 0) {
                        issueNumber = issueNumber.replace(" ", "");
                    }
                    issueNumber = session.userData.issueNumber = session.userData.issueNumber = issueNumber;
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
        this._dialog.on("GetAllIssues", function (session, args) {
            // Resolve and store any entities passed from LUIS.
            let status = builder.EntityRecognizer.findEntity(args.entities, "issue_status");
            let type = builder.EntityRecognizer.findEntity(args.entities, "issue_type");
            let assignedTo = builder.EntityRecognizer.findEntity(args.entities, "assigned_to");
            let query = session.userData.query = {
                status: status ? status.entity : null,
                type: type ? type.entity : null,
                assignedTo: assignedTo ? assignedTo.entity : null
            };
            let jsearch = new JiraQueryBuilder();
            if (query.type)
                jsearch.where("issueType", _.capitalize(query.type));
            if (query.status)
                jsearch.where("status", _.capitalize(query.status));
            if (query.assignedTo) {
                if (query.assignedTo === "my" || query.assignedTo === "me") {
                    jsearch.where("assignee", "currentUser()");
                }
                else {
                    jsearch.where("assignee", query.assignedTo);
                }
            }
            let jqlquery = jsearch.query();
            that._jira.searchJira(jqlquery, null, (error, data) => {
                if (error) {
                    session.send("Error querying jira");
                }
                let issueList = "";
                _.forEach(data.issues, (issue) => {
                    issueList = `${issueList}\n${issue.key} :: ${issue.fields.summary}\n`;
                });
                session.send(issueList);
            });
            // session.send(`searching for issues with status ${query.status}, of type ${query.type} and assigned to ${query.assignedTo}`);
            // console.log(status, type, assignedTo);
        });
    }
}
module.exports = IssueHandler;
//# sourceMappingURL=IssueHandler.js.map