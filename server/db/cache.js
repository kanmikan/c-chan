const models = require('./models/dbmodels.js');
const mdbScheme = require('./models/mdbscheme.js');
const sConfig = require('../config/serverconfig.js');

var CACHE = {};
let collectionList = [
	mdbScheme.C_BOXS,
	mdbScheme.C_COMS,
	mdbScheme.C_ADM,
	mdbScheme.C_NOTIF,
	mdbScheme.C_CATS
];
var db;

function init(DB){
	db = DB;
	//obtener todo en cache.
	updateAll();
	
}

function update(cname, callback){
	query(db, cname, function(res){
		CACHE[cname] = res;
		callback(res);
	});
}

function updateAll(){
	collectionList.forEach(function(collection){
		query(db, collection, function(res){
			CACHE[collection] = res;
		});
	});
}

function getCache(){
	return CACHE;
}

function setCache(cache){
	CACHE = cache;
}

function query(DB, cname, callback){
	return new Promise((resolve, reject) => {
		DB.db(sConfig.DBNAME).collection(cname).find("").toArray(function(err, result){
			if (err){
				console.log("[Error] " + err);
			} else {
				callback(result);
			}
		});
	});
}

module.exports = {init, getCache, setCache, update, updateAll}