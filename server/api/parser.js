/* MANEJO DE TAGS, COMANDOS, ETC. DENTRO DE LOS CAMPOS DE ENTRADA. */
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const utils = require('../utils.js');
const pass = require('./passport.js');
const live = require('./live.js');

function parseInput(DB, cid, uid, rawtext){
	parseTags(DB, cid, uid, rawtext); //obligatoriamente, se invoca el parser de tags aunque no se utilize la informacion de retorno.
	
	return htmlSanitize(rawtext);
}

//detecta tags html y comandos dentro del input.
function htmlSanitize(rawtext){
	let patterns = [
		/<(.*?)>/g, //tags html en general.
		/::{1}([^\r\n\s]+)/gi, //link interno
		/>>{1}([^\r\n\s]{7})/gi, //tags
		/>(([https?|ftp]+:\/\/)([^\s/?\.#]+\.?)+(\/[^\s]*)?)/gi, //link externo
		/^(>(?!\>).+)/gim, //greentext
		/\n/g //salto de linea.
	];
	let pattern_replace = [
		'',
		'<a href="$1" class="link">&gt;$1</a>',
		'<a href="#$1" class="tag" data-tag="$1">&gt;&gt;$1</a>',
		'<a href="$1" target="_blank" class="link">&gt;$1</a>',
		'<span class="greentext">$1</span>',
		'<br>'
	]
	let output = rawtext.replace(/[\r\n]+$/, ''); //limpiar espacios innecesarios.
	
	for (var i =0; i < patterns.length; i++) {
		output = output.replace(patterns[i], pattern_replace[i]);
	}
	return output;
	
}

function parseTags(DB, cid, uid, rawtext){
	//se encarga de detectar los tags y actualizar la informacion en la base de datos..
	let tags = rawtext.match(/>>{1}([^\r\n\s]{7})/gi);
	if (tags){
		tags.forEach(async function(item, i){
			let selcid = tags[i].substring(2);
			dbManager.pushDB(DB, mdbScheme.C_COMS, {cid: selcid}, {$push: {"content.extra.tags": cid}});
			//notificar a los taggeados.
			let timestamp = Date.now();
			let c_receiver = await dbManager.queryDB(DB, mdbScheme.C_COMS, {cid: selcid}, "", function(){});
			let box = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: c_receiver[0].bid}, "", function(){});
			
			let notifdata = utils.clone(jsonScheme.NOTIF_SCHEME);
			notifdata.sender.uid = uid;
			notifdata.receiver.uid = c_receiver[0].user.uid;
			notifdata.date.created = timestamp;
			notifdata.state.push("new");
			notifdata.content.cid = cid;
			notifdata.content.bid = c_receiver[0].bid;
			notifdata.content.tag = true;
			notifdata.content.preview = {
				title: box[0].content.title,
				desc: htmlSanitize(rawtext),
				thumb: box[0].img.preview
			}
			console.log(notifdata);
			await dbManager.insertDB(DB, mdbScheme.C_NOTIF, notifdata, function(){});
			live.sendDataTo(c_receiver[0].user.uid, "notif", pass.filterProtectedUID(notifdata));
		});
	}
	
	return []; //por defecto, no hay tags
}

module.exports = {parseInput, parseTags}