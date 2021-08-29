/* COMPRUEBA LA JERARQUIA, BANEOS, WHITELIST, ETC. */
const dbManager = require('../db/dbManager');
const mdbScheme = require('../db/models/mdbScheme');
const sConfig = require('../config/serverConfig');

/* MIDDLEWARES */
function check(req, res, next){
	console.log("-middleware de control-");
	checkBan(req, res, function(ban){
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
	checkRecursiveRequest(req, res, mdbScheme.C_BOXS, sConfig.BOX_DELAY, function(rreq){
		if (rreq){
			res.send(rreq);
		} else {
			if (!req.fields.cat || req.fields.cat.trim() === ""){
				callback({success: false, data: "Elige una categoria valida"});
			} else if (!req.fields.title || req.fields.title.trim() === "") {
				if (req.fields.title.trim().length < 5){
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
	})
}

function comFields(req, res, callback){
	checkRecursiveRequest(req, res, mdbScheme.C_COMS, sConfig.COMMENT_DELAY, function(rreq){
		if (rreq){
			res.send(rreq);
		} else {
			checkTags(req, res, function(tres){
				if (tres){
					callback(tres);
				} else {
					if (req.fields.img.trim() === "" && req.fields.vid.trim() === ""){
						if (req.fields.content.trim() === ""){
							callback({success: false, data: "Escribe algo o sube una imagen."});
						} else {
							callback(null);
						}
					} else {
						callback(null);
					}
				}
			});
		}
	});
}

//FUNCION: micro parser que analiza los tags
function checkTags(req, res, callback){
	let tags = (req.fields.content).match(/>>{1}([^\r\n\s]{7})/gi);
	if (tags !== null){
		if (tags.length > sConfig.MAX_TAGS){
			callback({success: false, data: `Máximo permitido ${sConfig.MAX_TAGS} tags.`});
		} else {
			for (var i=0; i < tags.length; i++) {
				for (var x=0; x < tags.length; x++){
					if ((i != x) && (tags[i] === tags[x])){
						return callback({success: false, data: "Hay tags repetidos"});
					}
				}	
			}
			callback(null); //al no haber repetidos
		}
	} else {
		callback(null); //al no haber tags
	}
}

//FUNCION: calcula el tiempo del ultimo comentario guardado y el momento del request actual.
function checkRecursiveRequest(req, res, cname, delay, callback){
	let currentTimestamp = Date.now();
	dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, {"user.uid": req.session.id}, {"date.created": -1}, function(coms){
		let ultimoComentario = coms[0].date.created;
		let diferencia = (currentTimestamp - ultimoComentario) / 1000;
		let faltan = delay - diferencia;
		if (diferencia < delay){
			callback({success: false, data: `Espera ${faltan} segundos.`});
		} else {
			callback(null);
		}
	});
}

function checkBan(req, res, callback){
	dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {uid: req.session.id}, "", function(userdata){
		if (userdata[0] && userdata[0].state.includes("banned")){
			callback({success: false, data: {banned: true, bandata: userdata[0].extra.bandata}});
		} else {
			callback(null);
		}
	});
}

module.exports = {check, checkBoxFields, checkComFields}