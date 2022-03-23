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
	const pre2 = (process.env.YUU_INS2 === undefined) ? ["tetón"] : process.env.YUU_INS2.split(",");
	const pre3 = ["", "anon", "anoncete", "", "y...", "gordo", ":P", ":)", "&lt;3", "&lt;/3"];
	const pre4 = ["bueno", "muy bueno", "malo", "muy malo", "estupendo", "feo", "lindo", "raro", "tierno", "agradable"];
	
	
	//respuestas tiradas al aire
	const resp1 = [
		`</br>Que me mencionas ${pre1[Math.floor(Math.random() * pre1.length)]}`,
		`</br>${pre3[Math.floor(Math.random() * pre3.length)]}`,
		`</br>no entendí`,
		`</br>tamos al pedo mijo?`,
		``,
		`</br>no respondo a eso`,
		`</br>me cuesta entender lo que decis`,
		`</br>${pre4[Math.floor(Math.random() * pre4.length)]}`,
		`</br>basta ${pre2[Math.floor(Math.random() * pre2.length)]}`,
		`</br>Te recuerdo leer las reglas <a class="link" target="blank" href="/info/reglas">acá</a> asi no te tengo que domar`
	];
	
	//respuestas a preguntas concretas
	const resp2 = [
		`</br>no se`,
		`</br>si`,
		`</br>no`,
		`</br>vos sabras`
	];
	
	//respuestas a preguntas de opinion
	const resp3 = [
		`</br>puede ser`,
		`</br>creo que es ${pre4[Math.floor(Math.random() * pre4.length)]} ${pre3[Math.floor(Math.random() * pre3.length)]}`,
		`</br>me parece ${pre4[Math.floor(Math.random() * pre4.length)]} ${pre3[Math.floor(Math.random() * pre3.length)]}`
	];
	
	//respuestas a saludos (llegada)
	const resp4 = [
		`</br>hola ${pre3[Math.floor(Math.random() * pre3.length)]}`,
		`</br>Ya llegué ${pre3[Math.floor(Math.random() * pre3.length)]}`,
		`</br>que tal ${pre3[Math.floor(Math.random() * pre3.length)]}`
	];
	
	//respuesta a afecto
	const resp5 = [
		`</br>que es eso?`,
		`</br>gracias`,
		`</br>ok. ${pre3[Math.floor(Math.random() * pre3.length)]}`,
		`</br>eeh? *blush*`,
		`</br>ayumu tambien habla de eso`,
		`</br>bien por vos`
	];
	
	//respuesta a despedida
	const resp6 = [
		`</br>chau ${pre3[Math.floor(Math.random() * pre3.length)]}`,
		`</br>Hasta la próxima ${pre3[Math.floor(Math.random() * pre3.length)]}`,
		`</br>Dale ${pre3[Math.floor(Math.random() * pre3.length)]}`
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
	
	//parser de taggeos
	data.comment = cparser.htmlParser(`>>${cid}`);
	
	let resp = "";
	
	//pseudorespuestas, se concatenan.
	resp += pseudoAnswer(raw, new RegExp(`\\b(ayuda|ashuda|help)\\b`, "mgi"), `</br>Si necesitas info sobre la página, entrá <a class="link" target="blank" href="/info/welcome">acá</a>`);
	resp += pseudoAnswer(raw, new RegExp(`\\b(ayumu.)\\b`, "mgi"), `</br>Ayumu es mi mejor amiga`);

	//deteccion neutra
	resp += pseudoAnswer(raw, new RegExp(`\\b(hola.+?|que tal|como andas|hi.+?|dias)\\b`, "mgi"), `${resp4[Math.floor(Math.random() * resp4.length)]}`);
	resp += pseudoAnswer(raw, new RegExp(`\\b(amo.+?|linda|waifu|novia|bebe|mam.)\\b`, "mgi"), `${resp5[Math.floor(Math.random() * resp5.length)]}`);
	resp += pseudoAnswer(raw, new RegExp(`\\b(chau|dormir|mimir|noches)\\b`, "mgi"), `${resp6[Math.floor(Math.random() * resp6.length)]}`);
	
	//responsiva
	resp += pseudoAnswer(raw, new RegExp(`\\w+(?:\\s+\\w+)*\\s*\\?`, "mgi"), `${resp2[Math.floor(Math.random() * resp2.length)]}`);
	resp += pseudoAnswer(raw, new RegExp(`\\b(te parece|pensas|opinas)\\b`, "mgi"), `${resp3[Math.floor(Math.random() * resp3.length)]}`);
	
	//si no hay match, responder algo al azar
	if (resp === ""){
		resp = `${resp1[Math.floor(Math.random() * resp1.length)]}`;
	}
	
	data.comment += resp;
	
	//enviar comentario del bot.
	cinterface.createCom(DB, data, function(){}, async function(){
		cparser.parseTags(DB, botcid, data.user.uid, `>>${cid}${resp}`);
	});
	
}

function pseudoAnswer(raw, regex, respuesta){
	let rgx = regex.exec(raw);
	return (rgx) ? respuesta : "";
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
	
	//parser de taggeos
	cparser.parseTags(DB, botcid, data.user.uid, `>>${cid}`);
	data.comment = cparser.htmlParser(`>>${cid}`);
	
	//cuerpo del comentario
	data.comment += `<div class="advertencia">Has sido advertido porque tu accion infringe las reglas, por favor lee las reglas <a style="color: #ffeb3b;" target="blank" href="/info/reglas">acá</a>.<br>Si continuas vas a ser muteado temporalmente para proteger al sitio.</div>`;
	
	//enviar comentario del bot.
	cinterface.createCom(DB, data, function(){}, async function(){
		console.log("[YuuBot] Yuu ha advertido al usuario " + uid);
	});
}

function commands(DB, bid, cid, uid, rawtext){
	/*
	let comm1 = new RegExp(/\$yuu[^.](.+)/gi).exec(rawtext);
	if (comm1 != null){
		
	}
	*/
}


module.exports = {commands, modCom}