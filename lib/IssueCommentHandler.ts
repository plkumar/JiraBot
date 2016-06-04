import builder = require('botbuilder');
import JiraQueryBuilder = require('./JiraQueryBuilder');
import _ = require('lodash');

class IssueCommentHandler implements IJiraBotHandler {

    _dialog: builder.LuisDialog;
    _jira: any;

    constructor(dialog: builder.LuisDialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }

    attachHandler() {
        var that = this;
        this._dialog.on('ShowComments', [
            (session, args: luis.LUISResponse, next) => {
                var issueNumber = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');

                var commentObject = session.dialogData.commentObject = {
                    issueNumber: issueNumber ? issueNumber.entity : session.dialogData.issueNumber ? session.dialogData.issueNumber : null,
                }


                if (!commentObject.issueNumber) {
                    builder.Prompts.text(session, "which issue comments you would like to see");
                } else {
                    next();
                }
            },
            (session, results) => {
                if (!session.dialogData.commentObject && session.dialogData.commentObject.issueNumber) {
                    var commentObject = session.dialogData.issueNumber = {
                        issueNumber: results.response ? results.response : null,
                    }
                }

                session.send(`getting comments for issue ${commentObject.issueNumber}`);
            }
        ]);

        this._dialog.on("AddComment", [function (session, args: luis.LUISResponse, next) {

            var issueNumber = builder.EntityRecognizer.findEntity(args.entities, 'issue_number');
            var commentText = builder.EntityRecognizer.findEntity(args.entities, 'comment_text');

            var commentObject = session.dialogData.commentObject = {
                issueNumber: issueNumber ? issueNumber.entity : session.dialogData.issueNumber ? session.dialogData.issueNumber : null,
                commentText: commentText ? commentText.entity : null
            };

            if (!commentObject.issueNumber) {
                builder.Prompts.text(session, "Enter issue number");
            } else {
                next();
            }

        }, function (session, results, next) {
            //console.log(results.response);
            var commentObject = session.dialogData.commentObject;
            if (results.response) {
                commentObject.issueNumber = results.response;
            }

            if (!commentObject.commentText) {
                builder.Prompts.text(session, "Enter comment text.");
            } else {
                next();
            }

        }, function (session, results) {
            //console.log(results.response);
            var commentObject = session.dialogData.commentObject;
            if (results.response) {
                commentObject.commentText = results.response;
            }

            if (commentObject.issueNumber && commentObject.commentText) {
                session.send(`creating comment on issue ${commentObject.issueNumber} text: ${commentObject.commentText}`);
            } else {
                session.send("Not sure what to do.");
            }
        }]);
    }
}

export = IssueCommentHandler;