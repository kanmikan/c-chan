require('dotenv').config();

const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const utils = require('../utils.js');
const upload = require('../api/upload.js');
const cparser = require('../api/parser.js');
const builder = require('../api/builder.js');
const live = require('../api/live.js');
const pass = require('../api/passport.js');
const cache = require('../db/cache.js');
const sesionManager = require('../sesion/sesionmanager.js');

const cinterface = require('./contentinterface.js');
const moderation = require('../api/moderation.js');
const confusables = require('confusables').remove;

const wordBlackList = (process.env.YUU_BLACKLIST === undefined) ? [] : process.env.YUU_BLACKLIST.split(",");

var BRAIN = {};
let MAX_ALERT_INDEX = 2;

//TODO: lo mismo pero para el contenido del box
function modBox(req, res, next){
	
}

//analiza las palabras del comentario
function modCom(cid, req){
	let rawInput = req.fields.content.trim();
	let bid = req.fields.bid;
	let uid = req.session.uid;
	
	//limpieza
	rawInput = confusables(rawInput);
	//TODO: filtrar l33tsp3ak
	
	//comprobacion
	let pattern = "";
	for (let i=0; i<wordBlackList.length; i++){
		pattern += `${wordBlackList[i]}|`;
	}
	pattern = pattern.substr(0, pattern.length - 1);
	let regexPattern = new RegExp(`\\b(${pattern})\\b`, "mgi").exec(rawInput);
	
	//deteccion
	if (regexPattern){
		//si hay un match, loguear el request y añadir un indice de alerta.
		let requestData = {
			uid: uid,
			time: Date.now()
		}
		
		if (BRAIN[uid]){
			//si ya existe un reporte, sumar un indice de alerta.
			BRAIN[uid] = {
				requestData: requestData,
				alertIndex: BRAIN[uid].alertIndex + 1
			}
		} else {
			//sino, crear el reporte.
			BRAIN[uid] = {
				requestData: requestData,
				alertIndex: 1
			}
		}
		//accion
		if (BRAIN[uid] && BRAIN[uid].alertIndex > MAX_ALERT_INDEX){
			
			if (BRAIN[uid].alertIndex >= MAX_ALERT_INDEX+2){
				//ya advertido, proceder a la accion.
				console.log("[YuuBot] El usuario ha echo caso omiso a la advertencia");
				
				//TODO: bloquear acceso via IP y user-agent
				
				//quitar los permisos de creacion de comentarios y temas
				dbManager.pushDB(req.app.locals.db, mdbScheme.C_ADM, {uid: uid}, {$pull: {permisos: {"$in": ["CREAR_COM","CREAR_BOX"]}}}, () => {});
				cache.updateAll();
				sesionManager.disposeAll();
				BRAIN[uid].alertIndex = 0;
			} else {
				//si el indice de alerta del usuario es mayor a MAX, enviar una advertencia
				sendADV(req.app.locals.db, cid, bid, uid);
			}
		}
	} else {
		//yuubot tambien es un meme
		let yuucall = new RegExp(`\\b(yuu|yuyu|yuubot)\\b`, "mgi").exec(rawInput);
		if (yuucall){
			sendYuuResponse(req.app.locals.db, cid, bid, uid, rawInput);
		}
	}
	
}

function sendYuuResponse(DB, cid, bid, uid, raw){
	const pre1 = (process.env.YUU_INS === undefined) ? [] : process.env.YUU_INS.split(",");
	
	const resp1 = [
		`</br>Que me mencionas ${pre1[Math.floor(Math.random() * pre1.length)]}`,
		`</br>Si necesitas info sobre la página, entrá <a class="link" target="blank" href="/info/welcome">acá</a>`,
		`</br>no se`,
		`</br>si`,
		`</br>no`,
		`</br>no entendí`,
		`</br>puede ser`,
		`</br>hola`,
		`</br>tamos al pedo mijo?`,
		``,
		`</br>basta tetón`,
		`</br>Te recuerdo leer las reglas <a class="link" target="blank" href="/info/reglas">acá</a> asi no te tengo que domar`,
	];
	
	let botcid = utils.genCID(7);
	let data = utils.clone(jsonScheme.COMMENT_SCHEME);
	data.cid = botcid;
	data.bid = bid;
	data.user.uid = "yuubot";
	data.user.jerarquia = {
		nick: "Yuu Takasaki",
		rango: "ModBot",
		color: "#00aa00"
	};
	data.icon = "/assets/anon/yuu.png"
	data.comment = cparser.htmlParser(`>>${cid}`); //taggeo
	
	let yuuask = new RegExp(`\\b(ayuda|ashuda|help)\\b`, "mgi").exec(raw);
	if (yuuask){
		data.comment += `${resp1[1]}`;
	} else {
		data.comment += `${resp1[Math.floor(Math.random() * resp1.length)]}`;
	}
	
	//enviar comentario del bot.
	//TODO: es un copypaste de abajo... eso
	cinterface.createCom(DB, data, function(){}, async function(){
		let box = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: bid}, "", () => {});
		let notifdata = builder.notification({
			suid: data.user.uid,
			ruid: uid,
			cid: botcid,
			bid: bid,
			tag: true,
			title: box[0].content.title,
			desc: data.comment,
			thumb: (box[0].type.includes("video")) ? box[0].media.preview : box[0].img.preview
		});
		await dbManager.insertDB(DB, mdbScheme.C_NOTIF, notifdata, function(){});
		live.sendDataTo(uid, "notif", pass.filterProtectedUID(notifdata));
	});
	
}

function sendADV(DB, cid, bid, uid){
	let botcid = utils.genCID(7);
	let data = utils.clone(jsonScheme.COMMENT_SCHEME);
	data.cid = botcid;
	data.bid = bid;
	data.user.uid = "yuubot";
	data.user.jerarquia = {
		nick: "Yuu Takasaki",
		rango: "ModBot",
		color: "#00aa00"
	};
	data.icon = "/assets/anon/yuu.png"
	
	//cuerpo del comentario
	data.comment = cparser.htmlParser(`>>${cid}`);
	data.comment += `<div class="advertencia">Has sido advertido porque tu accion infringe las reglas, por favor lee las reglas <a style="color: #ffeb3b;" target="blank" href="/info/reglas">acá</a>.<br>Si continuas vas a ser muteado temporalmente para proteger al sitio.</div>`;
	
	//enviar comentario del bot.
	cinterface.createCom(DB, data, function(){}, async function(){
		let box = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: bid}, "", () => {});
		let notifdata = builder.notification({
			suid: "yuubot",
			ruid: uid,
			cid: botcid,
			bid: bid,
			tag: true,
			title: box[0].content.title,
			desc: data.comment,
			thumb: (box[0].type.includes("video")) ? box[0].media.preview : box[0].img.preview
		});
		await dbManager.insertDB(DB, mdbScheme.C_NOTIF, notifdata, function(){});
		live.sendDataTo(uid, "notif", pass.filterProtectedUID(notifdata));
		console.log("[YuuBot] Yuu ha advertido al usuario " + uid);
	});
}

function commands(DB, bid, cid, uid, rawtext){
	let comm1 = new RegExp(/\$yuu[^.](.+)/gi).exec(rawtext);
	if (comm1 != null){
		
	}
}


module.exports = {commands, modCom}