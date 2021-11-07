/* SE ENCARGA DE CREAR LA ESTRUCTURA POR DEFECTO NECESARIA SI NO DETECTA NINGUNA CREADA, EJEMPLO, LAS CATEGORIAS POR DEFECTO */
const mdbScheme = require('./models/mdbscheme.js');
const dbManager = require('./dbmanager.js');
const defScheme = require('./models/defaultscheme.js');
const jsonScheme = require('./models/jsonscheme.js');
const sConfig = require('../config/serverconfig.js');
const cache = require('./cache.js');
const utils = require('../utils.js');

function init(DB){
	//analizar si esta definida la base de datos de categorias
	DB.db(sConfig.DBNAME).collection(mdbScheme.C_CATS).find({}).toArray(function(err, cats){
		if (cats.length === 0) {
			console.log("[Defaults] Generando lista de categorias por defecto.");
			genDefCategories(DB);
			//actualizar cache incluyendo las categorias.
			cache.update(mdbScheme.C_CATS, function(){});
		}
	});
	//configuraciones por defecto
	DB.db(sConfig.DBNAME).collection(mdbScheme.C_SVR).find({}).toArray(function(err, server){
		if (server.length === 0) {
			console.log("[Defaults] Generando configuracion de estado del server por defecto.");
			genDefConfig(DB);
			//actualizar cache
			cache.update(mdbScheme.C_SVR, function(){});
		}
	});
}

function genDefCategories(DB){
	defScheme.DEFAULT_CATEGORIES.forEach(function(category){
		let scheme = utils.clone(jsonScheme.CATEGORY_SCHEME);
		scheme.catid = category[0];
		scheme.content.tid = category[1];
		scheme.content.name = category[2];
		scheme.content.description = category[3];
		scheme.content.media.icon = category[4];
		scheme.content.media.image = category[5];		
		if (category[6]){
			scheme.state.push(category[6]);
		}
		if (category[7]){
			scheme.date.sticky = parseInt(category[7]);
		}
		dbManager.insertDB(DB, mdbScheme.C_CATS, scheme, function(){});
	});
}

function genDefConfig(DB){
	let scheme = utils.clone(jsonScheme.SVRCONFIG_SCHEME);
	dbManager.insertDB(DB, mdbScheme.C_SVR, scheme, function(){});
}

module.exports = {init};