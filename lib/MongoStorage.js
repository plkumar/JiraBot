"use strict";
const MongoClient = require("mongodb");
class MongoStorage {
    constructor(conn) {
        var that = this;
        this._connectionString = conn;
        this._client = new MongoClient.MongoClient();
        this._client.connect(this._connectionString, (err, db) => {
            if (!err) {
                that._db = db;
            }
            else {
                throw "Not able to connect to database.";
            }
        });
    }
    get(id, callback) {
        var that = this;
        var collection = this._db.collection('session');
        collection.findOne({ '_id': id }).then((data) => {
            callback(null, data.data);
        }, (reason) => {
            callback(reason, null);
        });
    }
    save(id, data, callback) {
        // Get the documents collection
        var collection = this._db.collection('session');
        // Insert some documents
        collection.insertOne({ _id: id, data: data }, function (err, result) {
            if (err) {
                callback(err);
            }
        });
    }
}
module.exports = MongoStorage;
//# sourceMappingURL=MongoStorage.js.map