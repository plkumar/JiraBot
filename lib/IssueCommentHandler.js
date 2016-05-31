"use strict";
class IssueCommentsHandler {
    constructor(dialog, jira) {
        this._dialog = dialog;
        this._jira = jira;
    }
    attachHandler() {
        var that = this;
        this._dialog.on('ShowComments', function (session, args) {
        });
    }
}
//# sourceMappingURL=IssueCommentHandler.js.map