"use strict";
const builder = require('botbuilder');
class LogWorkHandler {
    constructor(dialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }
    attachHandler() {
        this._dialog.on("LogWork", [function (session, args, next) {
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
    }
}
module.exports = LogWorkHandler;
//# sourceMappingURL=LogWorkHandler.js.map