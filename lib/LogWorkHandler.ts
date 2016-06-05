import builder = require('botbuilder');
import JiraQueryBuilder = require('./JiraQueryBuilder');

class LogWorkHandler implements IJiraBotHandler{
    _dialog: builder.LuisDialog;
    _jira: any;

    constructor(dialog: builder.LuisDialog, jira: any) {
        this._dialog = dialog;
        this._jira = jira;
    }

    attachHandler() {
        var that = this;
        this._dialog.on("LogWork", [function (session, args: luis.LUISResponse, next) {
            var issueNumber = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');
            var duration = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.duration');

            var logWorkObject = session.userData.logWorkObject = {
                issueNumber: issueNumber ? issueNumber.entity : session.userData.issueNumber ? session.userData.issueNumber : null,
                duration: duration ? duration.resolution.duration : null
            }

            if (!logWorkObject.issueNumber) {
                builder.Prompts.text(session, "Please enter an issue number.");
            } else if (!logWorkObject.duration) {
                builder.Prompts.text(session, "enter duration.");
            } else {
                next()
            }
        }, function (session, results, next) {
            next();
        }, function (session, results) {
            session.send(`logging ${session.userData.logWorkObject.duration} on issue # ${session.userData.logWorkObject.issueNumber}`);
        }]);
    }
}

export = LogWorkHandler;