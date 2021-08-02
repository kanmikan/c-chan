const client = require('mongodb').MongoClient;
const sConfig = require('../serverConfig');

function connect(dbURL, config, callback){
	client.connect(dbURL, config, function (err, db){
		if (err){
			console.log("[MongoDB] Error: " + err);
		} else {
			console.log("[MongoDB] Base de datos conectada.");
			callback(db);
		}
	});
}

function queryDB(DB, cname, query, sort, callback){
	return new Promise((resolve, reject) => {
		DB.db(sConfig.DBNAME).collection(cname).find(query).sort(sort).toArray(function(err, result){
			callback(result);
		});
	});
}

module.exports = {connect, queryDB};