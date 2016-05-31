import builder = require('botbuilder');
import JiraQueryBuilder = require('./JiraQueryBuilder');
import _ = require('lodash');

class IssueCommentsHandler implements IJiraBotHandler {
    
    _dialog : builder.LuisDialog;
    _jira : any;
    
    constructor(dialog: builder.LuisDialog, jira){
        this._dialog = dialog;
        this._jira = jira;
    }
    
    attachHandler()
    {
        var that = this;
        this._dialog.on('ShowComments', function (session, args: luis.LUISResponse) { 
            
        });
    }
}