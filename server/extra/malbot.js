/* BOT DE MYANIMELIST */
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const cparser = require('../api/parser.js');
const utils = require('../utils.js');
const live = require('../api/live.js');
const pass = require('../api/passport.js');
const Parser = require('rss-parser');

let parser = new Parser({
	customFields: {
		feed: ['media:thumbnail'],
		item: ['media:thumbnail'],
	}
});

async function check(DB, id, callback){
	let feed = await parser.parseURL('https://myanimelist.net/rss/news.xml');
	let element = feed.items[id];
	
	//comprobar si el tema ya fue creado
	dbManager.queryDB(DB, mdbScheme.C_BOXS, {"user.uid": "malbot"}, {"date.created": -1}, function(box){
		
		if (box[0]){
			let cexit = false;
			box.forEach(function(ybox){
				if (element.pubDate === ybox.content.extra.botdata.created || element.title === ybox.content.title){
					cexit = true;
				}
			});
			if (cexit){
				callback({success: false, data: "[MalBot] Publicacion igual."});
				return;
			} else {
				createBox(DB, element, function(response){
					callback({success: true, data: "[MalBot] La publicacion es distinta: Nuevo tema creado."});
				});
			}
		} else {
			createBox(DB, element, function(response){
				callback({success: true, data: "[MalBot] La publicacion es distinta: Nuevo tema creado."});
			});
		}
		
	});
}

function createBox(DB, data, callback){
	let time = Date.now();
	
	//let bid = utils.uuidv4();
	let bid = data.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").substr(0,80) + utils.uuidv4().split("-")[0];
	
	let mbox = utils.clone(jsonScheme.BOX_SCHEME);
	mbox.bid = bid;
	mbox.cat = "rss";
	mbox.user.uid = "malbot";
	mbox.user.jerarquia = {
		nick: "MalBot",
		rango: "Bot",
		color: "#3f51b5"
	};
	mbox.date.created = time;
	mbox.date.bump = time;
	//imagen
	mbox.type.push("image");
	mbox.img.full = data['media:thumbnail'];
	mbox.img.preview = data['media:thumbnail'];
	mbox.content.title = data.title;
	//body
	mbox.content.body = cparser.htmlSanitize(data.content) + '</br><span style="color: #5fb732">Leer mas en: </span>' + '<a target="_blank" href="' + data.guid + '">' + data.guid + '</a>';
	
	//parametros especiales del bot
	mbox.flag.push("rss");
	mbox.flag.push("bot");
	mbox.content.extra.botdata = {
		created: data.pubDate
	};
	
	//crear box.
	dbManager.insertDB(DB, mdbScheme.C_BOXS, mbox, function(result){
		callback(result);
		//live
		let protectedJSON = pass.filterProtectedUID(mbox);
		live.sendData("new", {kind: "newbox", data: protectedJSON});
		live.sendData("activity", {kind: "box", data: protectedJSON});
	});
}

module.exports = {check}