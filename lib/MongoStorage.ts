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
            if(!data) {
                callback(null, null);
            }else {
                callback(null, JSON.parse(data.data));
            }
        }, (reason) => {
            callback(reason, null)
        });
    }

    save(id: string, data: any, callback?: (err: Error) => void): void {
        // Get the documents collection
        var collection = this._db.collection('session');
        // Insert some documents
        //console.log(JSON.stringify(data));
        collection.update({_id:id},{_id:id,data :JSON.stringify(data)}, {upsert:true}, function (err, result) {
            if(err) {
                console.error(err)
                callback(err);
            }else{
                console.log(JSON.stringify(result));
            }
        });
    }
}

export = MongoStorage;