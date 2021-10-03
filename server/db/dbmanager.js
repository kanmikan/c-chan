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
	if (sConfig.DATABASE_CACHE){
		let CACHE = cache.getCache();
		var output_ = {};
		let count = 0;
		
		qlist.forEach(function(query){
			if (query[1] === ""){query[1] = {};}
			if (CACHE[query[0]]){
				let queryResult = new Query(query[1]).find(CACHE[query[0]]).sort(query[2]).limit(query[3]);
				output_[query[0]] = queryResult.all();
			} else {
				output_[query[0]] = {};
			}
			if (count === (qlist.length-1)){
				callback(output_);
				return output_;
			}
			count++;
		});
	} else {
		//query comun a la base de datos.
		var output = {};
		let count2 = 0;
		return new Promise(function(resolve, reject){
			qlist.forEach(function(query){
				DB.db(sConfig.DBNAME).collection(query[0]).find(query[1]).sort(query[2]).limit(query[3]).toArray(
				function (err, result){
					output[query[0]] = result;
					if (count2 === (qlist.length-1)){
						callback(output);
						resolve(output);
					}
					count2++;
				});
			});
		});
	}
}

function queryDB(DB, cname, query, sort, callback){
	if (sConfig.DATABASE_CACHE){
		if (query === ""){query = {};}
		let CACHE = cache.getCache();
		if (CACHE[cname]){
			let cursor = new Query(query).find(CACHE[cname]).sort(sort);
			callback(cursor.all());
			return cursor.all();
		}
	} else {
		return new Promise(function(resolve, reject){
			DB.db(sConfig.DBNAME).collection(cname).find(query).sort(sort).toArray(function(err, result){
				if (err){
					console.log("[Error] " + err);
				} else {
					callback(result);
					resolve(result);
				}
			});
		});
	}
}

//TODO: soporte para la cache.
function queryDBSkip(DB, cname, query, sort, from, to, callback){
	return new Promise(function(resolve, reject){
		DB.db(sConfig.DBNAME).collection(cname).find(query).sort(sort).skip(from).limit(to).toArray(function(err, result){
			if (err){
				console.log("[Error] " + err);
			} else {
				callback(result);
				resolve(result);
			}
		});
	});
}

function queryAggregate(DB, cname, aggregate, callback){
	return new Promise(function(resolve, reject){
		DB.db(sConfig.DBNAME).collection(cname).aggregate(aggregate).toArray(function(err, result){
			if (err){
				console.log("[Error] " + err);
			} else {
				callback(result);
				resolve(result);
			}
		});
	});
}

/* INSERCION DE DATOS A LA DB */
function insertDB(DB, cname, object, callback){
	return new Promise(function(resolve, reject){
		DB.db(sConfig.DBNAME).collection(cname).insertOne(object, function(err, result){
			if (sConfig.DATABASE_CACHE){
				//EN UNA ESCRITURA, ES PREFERIBLE EVITAR DESINCRONIZACIONES LLAMANDO SIEMPRE A LA BASE DE DATOS.
				//let CACHE = cache.getCache();
				//CACHE[cname].push(object);
				//cache.setCache(CACHE);
				cache.update(cname, function(){
					callback(result);
					resolve(result);
				});
			} else {
				callback(result);
				resolve(result);
			}
		});
	});
}

function pushDB(DB, cname, criterio, valor){
	return new Promise(function(resolve, reject){
		DB.db(sConfig.DBNAME).collection(cname).updateOne(criterio, valor, function (err, res){
			//TODO: un workaround bastante flojo... pero me sirve por ahora.
			if (sConfig.DATABASE_CACHE){
				cache.update(cname, function(){
					resolve(res);
				});
			}
		});
	});
}

function updateDBAll(DB, cname, criterio, valor, callback){
	return new Promise(function(resolve, reject){
		DB.db(sConfig.DBNAME).collection(cname).updateMany(criterio, {$set: valor}, function(err, result){
			if (sConfig.DATABASE_CACHE){
				cache.update(cname, function(){
					callback(result);
					resolve(result);
				});
			} else {
				callback(result);
				resolve(result);
			}
		});
	});
}

function deleteDB(DB, cname, criterio, callback){
	return new Promise(function(resolve, reject){
		DB.db(sConfig.DBNAME).collection(cname).remove(criterio, function(err, result){
			if (sConfig.DATABASE_CACHE){
				cache.update(cname, function(){
					callback(result);
					resolve(result);
				});
			} else {
				callback(result);
				resolve(result);
			}
		});
	});
}

module.exports = {connect, queryDB, mQuery, queryAggregate, insertDB, updateDBAll, pushDB, queryDBSkip, deleteDB};