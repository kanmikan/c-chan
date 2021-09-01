const client = require('mongodb').MongoClient;
const mdbScheme = require('./models/mdbscheme.js');
const sConfig = require('../config/serverconfig.js');
const cache = require('./cache.js');
const Query = require("mingo").Query;

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
	
	//test de cache
	let CACHE = cache.getCache();
	var rout = {};
	let count = 0;
	qlist.forEach(function(query){
		if (query[1] === ""){
			query[1] = {};
		}
		let q = new Query(query[1]);
		if (CACHE[query[0]]){
			let cursor = q.find(CACHE[query[0]]);
			cursor.sort(query[2]).limit(query[3]);
			rout[query[0]] = cursor.all();
		} else {
			rout[query[0]] = {};
		}
		
		if (count === (qlist.length-1)){
			callback(rout);
		}
		count++;
	});
	
	
	/*
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
	*/
}

function queryDB(DB, cname, query, sort, callback){
	
	//test de cache
	let CACHE = cache.getCache();
	let q = new Query(query);
	if (CACHE[cname]){
		let cursor = q.find(CACHE[cname]);
		cursor.sort(sort);
		callback(cursor.all());
	}
	
	/*
	return new Promise((resolve, reject) => {
		DB.db(sConfig.DBNAME).collection(cname).find(query).sort(sort).toArray(function(err, result){
			if (err){
				console.log("[Error] " + err);
			} else {
				callback(result);
			}
		});
	});
	*/
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
	
	//test de cache.
	let CACHE = cache.getCache();
	CACHE[cname].push(object);
	cache.setCache(CACHE);
	callback("");
	
	DB.db(sConfig.DBNAME).collection(cname).insertOne(object, function(err, result){
		//callback(result);
	});
}

function pushDB(DB, cname, criterio, valor){
	DB.db(sConfig.DBNAME).collection(cname).updateOne(criterio, valor, function (err, res){
		//TODO: un workaround bastante flojo... pero me sirve por ahora.
		cache.update(cname);
	});
}

function updateDBAll(DB, cname, criterio, valor, callback){
	DB.db(sConfig.DBNAME).collection(cname).updateMany(criterio, {$set: valor}, function(err, result){
		cache.update(cname);
		callback(result);
	});
}

module.exports = {connect, queryDB, mQuery, queryAggregate, insertDB, updateDBAll, pushDB};