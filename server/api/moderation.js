/* SE ENCARGA DE LOS BANEOS, ADVERTENCIAS Y ELIMINACION DE CONTENIDO */
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const sConfig = require('../config/serverconfig.js');
const utils = require('../utils.js');
const parser = require('./parser.js');
const sesionManager = require('../sesion/sesionmanager.js');

//TODO: advertir comentario de usuario con el bot de yuu.
function advUserByCID(DB, cid, callback){
	
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
	await dbManager.pushDB(DB, mdbScheme.C_ADM, {uid: uid}, [{$set: {"extra.bandata": bandata}}, {$push: {state: "BANNED"}}], () => {});
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

module.exports = {advUserByCID, banUserByCID, banUserByBID, banUser, deleteComment, deleteBox, moveBox, updateBoxParams}