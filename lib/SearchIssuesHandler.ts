import builder = require('botbuilder');
import JiraQueryBuilder = require('./JiraQueryBuilder');
import _ = require('lodash');

class SearchIssuesHandler implements IJiraBotHandler {

    _dialog: builder.LuisDialog;
    _jira: any;

    constructor(dialog: builder.LuisDialog, jira: any) {
        this._dialog = dialog;
        this._jira = jira;
    }

    attachHandler() {
        var that = this;
        this._dialog.on('GetAllIssues', function (session, args: luis.LUISResponse) {
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
                } else {
                    jsearch.where("assignee", query.assignedTo);
                }
            }

            var jqlquery = jsearch.query();


            that._jira.searchJira(jqlquery, null, (error, data) => {
                if (error) {
                    session.send("Error querying jira");
                }

                var issueList = ""
                _.forEach(data.issues, (issue) => {
                    issueList = `${issueList}\n${issue.key} :: ${issue.fields.summary}\n`
                });

                session.send(issueList);

            });

            //session.send(`searching for issues with status ${query.status}, of type ${query.type} and assigned to ${query.assignedTo}`);
            //console.log(status, type, assignedTo);
        });
    }
}

export = SearchIssuesHandler;