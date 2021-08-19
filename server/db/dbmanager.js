const client = require('mongodb').MongoClient;
const mdbScheme = require('./models/mdbScheme');
const sConfig = require('../config/serverConfig');

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

/* CONSULTAS A LA DB */
function mQuery(DB, qlist, callback){
	var rout = {};
	let count = 0;
	qlist.forEach(function(query){
		DB.db(sConfig.DBNAME).collection(query[0]).find(query[1]).sort(query[2]).limit(query[3]).toArray(
		function (err, result){
			rout[query[0]] = result;
			if (count === (qlist.length-1)){
				callback(rout);
			}
			count++;
		});
	});
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
	DB.db(sConfig.DBNAME).collection(cname).aggregate(aggregate).toArray(function(err, result){
		if (err){
			console.log("[Error] " + err);
		} else {
			callback(result);
		}
	});
}

/* INSERCION DE DATOS A LA DB */
function insertDB(DB, cname, object, callback){
	DB.db(sConfig.DBNAME).collection(cname).insertOne(object, function(err, result){
		callback(result);
	});
}

function updateDBAll(DB, cname, criterio, valor, callback){
	DB.db(sConfig.DBNAME).collection(cname).updateMany(criterio, {$set: valor}, function(err, result){
		callback(result);
	});
}

module.exports = {connect, queryDB, mQuery, queryAggregate, insertDB, updateDBAll};