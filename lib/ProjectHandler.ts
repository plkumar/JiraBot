import builder = require("botbuilder");
import JiraQueryBuilder = require("./JiraQueryBuilder");
import _ = require("lodash");

class ProjectHandler implements IJiraBotHandler {

    _dialog: builder.LuisDialog;
    _jira: any;

    constructor(dialog: builder.LuisDialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }

    attachHandler() {
        const that = this;
        this._dialog.on("GetProjects", [function (session, args: luis.LUISResponse, next) {

            if (args.entities.length > 0) {
                next();
            } else {
                that._jira.listProjects(function (error, result: [any]) {
                    // console.log("project", result);

                    let projects = [];
                    result.forEach((item) => {
                        projects.push(`[${item.key}] - ${item.name}`);
                    });
                    session.userData.projects = projects;
                    builder.Prompts.choice(session, "Choose project of your choice?", projects);
                });
            }
        }, function (session, results) {
            console.log(results);
            session.send(`Changing project to ${results.response.entity}`);
        }]);
    }
}

export = ProjectHandler;