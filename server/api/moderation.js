/* SE ENCARGA DE LOS BANEOS, ADVERTENCIAS Y ELIMINACION DE CONTENIDO */
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const sConfig = require('../config/serverconfig.js');
const utils = require('../utils.js');
const parser = require('./parser.js');
const pass = require('./passport.js');
const live = require('./live.js');
const sesionManager = require('../sesion/sesionmanager.js');

//TODO: advertir comentario de usuario con el bot de yuu.
function advUserByCID(DB, cid, callback){
	
}

//FUNCION: envia una alerta de denuncia.
async function sendADMFlag(DB, data, callback){
	
	let admlist = await dbManager.queryDB(DB, mdbScheme.C_ADM, {permisos: {$in: ["ADMIN", "GMOD", "MOD"]}}, "", () => {});
	let randomADM = Math.floor(Math.random() * admlist.length);
	let ruid = admlist[randomADM].uid;
	
	let notif = utils.clone(jsonScheme.NOTIF_SCHEME);
	notif.sender.uid = data.suid;
	notif.receiver.uid = ruid;
	notif.date.created = Date.now();
	notif.type.push("alert");
	notif.state.push("new");
	notif.content = {
		cid: data.cid,
		bid: data.bid,
		tag: !data.isBox
	}
	
	//obtener info
	if (data.isBox){
		//si es una denuncia a un tema
		//comprobar si el mismo usuario ya habia denunciado
		let boxAlerts = await dbManager.queryDB(DB, mdbScheme.C_NOTIF, {$and: [{type: {$in: ["alert"]}}, {"sender.uid": data.suid}, {"content.bid": data.bid}, {"content.tag": false}]}, "", () => {});
		
		if (!boxAlerts[0]){
			let box = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: data.bid}, "", () => {});
			notif.content.preview = {
				title: "Denunciaron un tema en: " + box[0].content.title,
				desc: data.razon,
				thumb: box[0].img.preview //imagen de alert
			}
			//enviar notificacion.
			dbManager.insertDB(DB, mdbScheme.C_NOTIF, notif, function(){
				live.sendDataTo(ruid, "notif", pass.filterProtectedUID(notif));
				callback({success: true, data: "Denuncia Enviada."});
			});
		} else {
			callback({success: false, data: "Ya denunciaste esto."});
		}
	} else {
		//si es una denuncia a un comentario
		//comprobar si el mismo usuario ya habia denunciado
		let comAlerts = await dbManager.queryDB(DB, mdbScheme.C_NOTIF, {$and: [{type: {$in: ["alert"]}}, {"sender.uid": data.suid}, {"content.cid": data.cid}, {"content.tag": true}]}, "", () => {});
		
		if (!comAlerts[0]){
			let com = await dbManager.queryDB(DB, mdbScheme.C_COMS, {cid: data.cid}, "", () => {});
			let box = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: com[0].bid}, "", () => {});
			
			notif.content.bid = com[0].bid;
			notif.content.preview = {
				title: "Denunciaron un comentario en: " + box[0].content.title,
				desc: data.razon,
				thumb: box[0].img.preview //imagen de alert
			}
			//enviar notificacion.
			dbManager.insertDB(DB, mdbScheme.C_NOTIF, notif, function(){
				live.sendDataTo(ruid, "notif", pass.filterProtectedUID(notif));
				callback({success: true, data: "Denuncia Enviada."});
			});
		} else {
			callback({success: false, data: "Ya denunciaste esto."});
		}
	}
}

async function banUserByCID(DB, cid, razon, time, callback){
	let comment = await dbManager.queryDB(DB, mdbScheme.C_COMS, {cid: cid}, "", () => {});
	let userData = await dbManager.queryDB(DB, mdbScheme.C_ADM, {uid: comment[0].user.uid}, "", () => {});
	banUser(DB, comment[0].user.uid, razon, time, callback);
}

async function banUserByBID(DB, bid, razon, time, callback){
	let box = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: bid}, "", () => {});
	banUser(DB, box[0].user.uid, razon, time, callback);
}

async function moveBox(DB, bid, newcat, callback){
	await dbManager.pushDB(DB, mdbScheme.C_BOXS, {bid: bid}, {$set: {cat: newcat}}, () => {});
	callback({success: true, data: "movido."});
}

async function banUser(DB, uid, razon, time, callback){
	let bandata = {
		ip: "", //TODO: userData.ip; desactivado.
		fecha: Date.now(),
		duracion: time,
		razon: razon
	};
	await dbManager.pushDB(DB, mdbScheme.C_ADM, {uid: uid}, {$push: {state: "BANNED"}, $set: {"extra.bandata": bandata}}, () => {});
	callback({success: true, data: bandata});
}

async function updateBoxParams(DB, bid, params, callback){
	await dbManager.pushDB(DB, mdbScheme.C_BOXS, {bid: bid}, {$set: params}, () => {});
	callback({success: true, data: "modificado."});
}

function deleteBox(DB, bid, callback){
	dbManager.deleteDB(DB, mdbScheme.C_BOXS, {bid: bid}, function(){
		callback({success: true, data: `tema ${bid} eliminado.`});
	})
}

function deleteComment(DB, cid, callback){
	dbManager.deleteDB(DB, mdbScheme.C_COMS, {cid: cid}, function(){
		callback({success: true, data: `comentario ${cid} eliminado.`});
	})
}

module.exports = {advUserByCID, banUserByCID, banUserByBID, banUser, deleteComment, deleteBox, moveBox, updateBoxParams, sendADMFlag}