"use strict";
const builder = require("botbuilder");
class IssueCommentHandler {
    constructor(dialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }
    attachHandler() {
        const that = this;
        this._dialog.on("ShowComments", [
                (session, args, next) => {
                let issueNumber = builder.EntityRecognizer.findEntity(args.entities, "issue_number");
                let commentObject = session.userData.commentObject = {
                    issueNumber: issueNumber ? issueNumber.entity : session.userData.issueNumber ? session.userData.issueNumber : null,
                };
                if (!commentObject.issueNumber) {
                    builder.Prompts.text(session, "which issue comments you would like to see");
                }
                else {
                    next();
                }
            },
                (session, results) => {
                if (!session.userData.commentObject && session.userData.commentObject.issueNumber) {
                    let commentObject = session.userData.issueNumber = {
                        issueNumber: results.response ? results.response : null,
                    };
                }
                session.send(`getting comments for issue ${session.userData.commentObject.issueNumber}`);
            }
        ]);
        this._dialog.on("AddComment", [function (session, args, next) {
                let issueNumber = builder.EntityRecognizer.findEntity(args.entities, "issue_number");
                let commentText = builder.EntityRecognizer.findEntity(args.entities, "comment_text");
                let commentObject = session.userData.commentObject = {
                    issueNumber: issueNumber ? issueNumber.entity : session.userData.issueNumber ? session.userData.issueNumber : null,
                    commentText: commentText ? commentText.entity : null
                };
                if (!commentObject.issueNumber) {
                    builder.Prompts.text(session, "Enter issue number");
                }
                else {
                    next();
                }
            },
                (session, results, next) => {
                // console.log(results.response);
                let commentObject = session.userData.commentObject;
                if (results.response) {
                    commentObject.issueNumber = results.response;
                }
                if (!commentObject.commentText) {
                    builder.Prompts.text(session, "Enter comment text.");
                }
                else {
                    next();
                }
            },
                (session, results) => {
                // console.log(results.response);
                let commentObject = session.userData.commentObject;
                if (results.response) {
                    commentObject.commentText = results.response;
                }
                if (commentObject.issueNumber && commentObject.commentText) {
                    session.send(`creating comment on issue ${commentObject.issueNumber} text: ${commentObject.commentText}`);
                }
                else {
                    session.send("Not sure what to do.");
                }
            }]);
    }
}
module.exports = IssueCommentHandler;
//# sourceMappingURL=IssueCommentHandler.js.map