/* COMPRUEBA LA JERARQUIA, BANEOS, WHITELIST, ETC. */
const dbManager = require('../db/dbManager');
const mdbScheme = require('../db/models/mdbScheme');

/* MIDDLEWARES */
function check(req, res, next){
	console.log("-middleware de control-");
	checkBan(req, res, req.session.id, function(ban){
		if (ban){
			res.send(ban);
		} else {
			next();
		}
	});
}

function checkBoxFields(req, res, next){
	boxFields(req, res, function(data){
		if (data){
			res.send(data);
		} else {
			next();
		}
	});
}

function checkComFields(req, res, next){
	comFields(req, res, function(data){
		if (data){
			res.send(data);
		} else {
			next();
		}
	});
}


/* UTILITARIOS */
function boxFields(req, res, callback){
	if (!req.fields.cat || req.fields.cat.trim() === ""){
		callback({success: false, data: "Elige una categoria valida"});
	} else if (!req.fields.title || req.fields.title.trim() === "") {
		if (req.fields.title.trim().length > 5){
			callback({success: false, data: "El titulo es muy corto"});
		} else {
			callback({success: false, data: "Falta un titulo"});
		}
	} else if (req.fields.img.trim() === "" && req.fields.vid.trim() === "") {
		callback({success: false, data: "Añade una imagen o video"});
	} else {
		callback(null);
	}
}

function comFields(req, res, callback){
	if (req.fields.img.trim() === "" && req.fields.vid.trim() === ""){
		if (req.fields.content.trim() === ""){
			callback({success: false, data: "Escribe algo o sube una imagen."});
		}
	} else {
		callback(null);
	}
}

function checkBan(req, res, uid, callback){
	dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {uid: uid}, "", function(userdata){
		if (userdata[0] && userdata[0].state.includes("banned")){
			callback({success: false, data: {banned: true, bandata: userdata[0].extra.bandata}});
		} else {
			callback(null);
		}
	});
}

module.exports = {check, checkBoxFields, checkComFields}