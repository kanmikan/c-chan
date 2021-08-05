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

function mQuery(DB, clist, callback){
	var obj = [];
	var resout = {};
	
	for (var i=0; i<clist.length; i++){
		let clt = clist[i];
		
		//prueba
		DB.db(sConfig.DBNAME).collection(clt[0]).find(clt[1]).sort(clt[2]).toArray(function (err, result){
			obj.push(1);
			resout[clt[0]] = result;
			if (obj.length === clist.length){
				callback(resout);
			}
		});
		
	}
}

function queryDB(DB, cname, query, sort, callback){
	return new Promise((resolve, reject) => {
		DB.db(sConfig.DBNAME).collection(cname).find(query).sort(sort).toArray(function(err, result){
			if (err){
				console.log("[Error] " + err);
			} else {
				callback(result);
			}
		});
	});
}

function queryAggregate(DB, cname, aggregate, callback){
	DB.db(sConfig.DBNAME).collection("boxs").aggregate(aggregate).toArray(function(err, result){
		if (err){
			console.log("[Error] " + err);
		} else {
			callback(result);
		}
	});
}

module.exports = {connect, queryDB, mQuery, queryAggregate};