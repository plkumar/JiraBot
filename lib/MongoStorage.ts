import builder = require('botbuilder');
import MongoClient = require("mongodb");

class MongoStorage implements builder.IStorage {
    _connectionString: string;
    _client: MongoClient.MongoClient;
    _db: MongoClient.Db;

    constructor(conn: string) {
        var that = this;
        this._connectionString = conn;
        this._client = new MongoClient.MongoClient();
        this._client.connect(this._connectionString, (err, db) => {
            if (!err) {
                that._db = db;
            } else {
                throw "Not able to connect to database."
            }
        });
    }

    get(id: string, callback: (err: Error, data: any) => void): void {
        var that = this
        var collection = this._db.collection('session');
        collection.findOne({'_id':id}).then((data)=>{
            callback(null, data.data);
        }, (reason) => {
            callback(reason, null)
        });
    }

    save(id: string, data: any, callback?: (err: Error) => void): void {
        // Get the documents collection
        var collection = this._db.collection('session');
        // Insert some documents
        collection.insertOne({_id:id,data :data}, function (err, result) {
            if(err) {
                callback(err);
            }
        });
    }
}

export = MongoStorage;