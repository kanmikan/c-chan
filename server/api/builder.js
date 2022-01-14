/* FACILIDAD PARA MODULARIZAR LOS BUILDERS DE USO FRECUENTE */
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const utils = require('../utils.js');

function notification(data){
	let notifdata = utils.clone(jsonScheme.NOTIF_SCHEME);
	notifdata.sender.uid = data.suid;
	notifdata.receiver.uid = data.ruid;
	notifdata.date.created = Date.now();
	notifdata.state.push("new");
	notifdata.content.cid = data.cid;
	notifdata.content.bid = data.bid;
	notifdata.content.tag = data.tag;
	notifdata.content.preview = {
		title: data.title,
		desc: data.desc,
		thumb: data.thumb
	}
	return notifdata;
}

module.exports = {notification}