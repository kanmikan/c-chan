const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const avatar = require('../api/avatar.js');
const utils = require('../utils.js');
const pass = require('../api/passport.js');
const live = require('../api/live.js');

async function createCom(DB, data, before, callback){
	before();
	let mcom = utils.clone(jsonScheme.COMMENT_SCHEME);
	mcom.cid = (data.cid) ? data.cid : utils.genCID(7);
	mcom.bid = data.bid;
	mcom.user.uid = data.user.uid;
	mcom.user.jerarquia = data.user.jerarquia;
	
	mcom.type = data.type;
	mcom.img = data.img;
	
	mcom.date.created = Date.now();
	mcom.icon = (data.icon) ? data.icon : avatar.genAnon(data.type);
	mcom.content.body = data.comment;
	
	//insertar comentario
	await dbManager.insertDB(DB, mdbScheme.C_COMS, mcom, () => {});
	callback({success: true, data: mcom});
	
	//enviar comentario via socket
	let protectedJSON = pass.filterProtectedUID(mcom);
	live.sendDataTo(data.bid, "comment", {token: "no-token", op: false, data: protectedJSON});
	//enviar señal de nueva actividad a todos
	live.sendData("activity", {kind: "comment", data: protectedJSON});
	
}

module.exports = {createCom}