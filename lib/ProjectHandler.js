"use strict";
const builder = require('botbuilder');
class ProjectHandler {
    constructor(dialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }
    attachHandler() {
        var that = this;
        this._dialog.on('GetProjects', [function (session, args, next) {
                if (args.entities.length > 0) {
                    next();
                }
                else {
                    that._jira.listProjects(function (error, result) {
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
    }
}
module.exports = ProjectHandler;
//# sourceMappingURL=ProjectHandler.js.map