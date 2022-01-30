const sConfig = require('../config/serverconfig.js');
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const utils = require('../utils.js');

async function whitelist(DB, userData, callback){
	let accessConfig = await dbManager.queryDB(DB, mdbScheme.C_SVR, "", "", function(){})[0];
	let permisos = userData.permisos;
	
	if (accessConfig.whitelist && !(permisos.includes("WHITELIST") || permisos.includes("ADMIN") || permisos.includes("GMOD") || permisos.includes("MOD"))){
		callback({success: false, data: "<b>Whitelist Activada</b></br>Solo los usuarios permitidos pueden realizar esa acción."});
	} else {
		callback(null);
	}
	
}

async function login(req, res, next){
	let accessConfig = await dbManager.queryDB(req.app.locals.db, mdbScheme.C_SVR, "", "", function(){})[0];
	if (!accessConfig.login){
		res.json({success: false, data: "El login se encuentra desactivado."});
	} else {
		next();
	}	
}

async function coms(req, res, next){
	let accessConfig = await dbManager.queryDB(req.app.locals.db, mdbScheme.C_SVR, "", "", function(){})[0];
	if (!accessConfig.coms){
		res.json({success: false, data: "Los comentarios se encuentran desactivados."});
	} else {
		next();
	}	
}

async function boxs(req, res, next){
	let accessConfig = await dbManager.queryDB(req.app.locals.db, mdbScheme.C_SVR, "", "", function(){})[0];
	if (!accessConfig.boxs){
		res.json({success: false, data: "La creacion de hilos se encuentra desactivada."});
	} else {
		next();
	}	
}

module.exports = {whitelist, login, coms, boxs};