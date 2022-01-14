/* BOT DE MYANIMELIST */
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const utils = require('../utils.js');
const live = require('../api/live.js');
const pass = require('../api/passport.js');
const Parser = require('rss-parser');
const malScraper = require('mal-scraper');
const cinterface = require('./contentinterface.js');
const translate = require('@vitalets/google-translate-api');

let parser = new Parser({
	customFields: {
		feed: ['media:thumbnail'],
		item: ['media:thumbnail'],
	}
});

function commands(DB, bid, cid, uid, rawtext){
	/* Comandos del malbot */
	let malsearch = new RegExp(/\$malsearch[^.](.+)/gi).exec(rawtext);
	let malview = new RegExp(/\$malinfo[^.](.+)/gi).exec(rawtext);
	let malcheck = new RegExp(/\$malcheck[^.](.+)/gi).exec(rawtext);
	let malsimil = new RegExp(/\$malsimil[^.](.+)/gi).exec(rawtext);
	
	if (malsearch != null){
		searchAnime(DB, bid, malsearch[1], function(result){});
	}
	
	if (malview != null){
		previewAnime(DB, bid, malview[1], function(result){});
	}
	
	if (malcheck != null){
		listAnimes(DB, bid, malcheck[1], function(result){});
	}
	
	if (malsimil != null){
		similarAnimes(DB, bid, malsimil[1], function(result){});
	}
	/* fin de comandos del malbot */
}

function similarAnimes(DB, bid, criteria, callback){

	
}

function listAnimes(DB, bid, criteria, callback){
	console.log("[MalBot] Esta buscando informacion en MyAnimeList...");
	
	let params = criteria.split(" ");
	
	malScraper.getSeason(params[0], params[1])
		.then((data) => {
			
			let animes = [];
			for (var i=0; i<data.TV.length; i++){
				animes.push({name: data.TV[i].title, url: data.TV[i].link});
			}
			
			let cdata = {
				bid: bid,
				user: {
					uid: "malbot",
					jerarquia: {
						nick: "MalBot",
						rango: "Bot",
						color: "#3f51b5"
					}
				},
				comment: "",
				type: [],
				img: {
					preview: "",
					full: "",
					raw: ""
				}
			};
			
			cdata.comment = `<div class="comObject" style="border-radius: 5px;padding: 10px;"><span style="color: orange">Resultados de "${criteria}":</span></br><ul>`;
			
			animes.forEach(function(anm){
				cdata.comment += `<li><a href="${anm.url}">${anm.name}</a></li>`;
			});
			cdata.comment += `</ul></div>`;
			
			//crear comentario.
			cinterface.createCom(DB, cdata, function(){
				console.log("[MalBot] Creando comentario con la informacion obtenida.");
			}, function(result){
				callback(result);
			});
			
		}).catch((err) => {
			console.log(err);
		});
	
}

function previewAnime(DB, bid, name, callback){
	console.log("[MalBot] Esta buscando informacion en MyAnimeList...");
	malScraper.getInfoFromName(name)
		.then((data) => {
			
			let cdata = {
				bid: bid,
				user: {
					uid: "malbot",
					jerarquia: {
						nick: "MalBot",
						rango: "Bot",
						color: "#3f51b5"
					}
				},
				comment: "",
				type: ["image"],
				img: {
					preview: data.picture,
					full: data.picture,
					raw: ""
				}
			};
			
			translateCallback(data.synopsis, function(tres){
				
				cdata.comment = `<div class="comObject" style="border-radius: 5px;padding: 10px;">
				<span>${data.title} - ${data.premiered}</span>
				</br>
				<a href="${data.url}" target="_blank">${data.url}</a>
				</br>
				<span>${tres.text}</span>
				</br>
				</div>`;
				
				//crear comentario.
				cinterface.createCom(DB, cdata, function(){
					console.log("[MalBot] Creando comentario con la informacion obtenida.");
				}, function(result){
					callback(result);
				});
				
			});
			
		}).catch((err) => {
			console.log(err);
		});
}

function searchAnime(DB, bid, query, callback){
	console.log("[MalBot] Esta buscando informacion en MyAnimeList...");
	malScraper.getResultsFromSearch(query)
		.then((data) => {
			//construir cuerpo del comentario y enviar los datos al commentInterface
			//console.log(data);
			
			let animes = [];
			for (var i=0; i<data.length; i++){
				animes.push({name: data[i].name, url: data[i].url});
			}
			
			let cdata = {
				bid: bid,
				user: {
					uid: "malbot",
					jerarquia: {
						nick: "MalBot",
						rango: "Bot",
						color: "#3f51b5"
					}
				},
				comment: "",
				type: [],
				img: {
					preview: "",
					full: "",
					raw: ""
				}
			};
			
			cdata.comment = `<div class="comObject" style="border-radius: 5px;padding: 10px;"><span style="color: orange">Resultados de "${query}":</span></br><ul>`;
			
			animes.forEach(function(anm){
				cdata.comment += `<li><a href="${anm.url}">${anm.name}</a></li>`;
			});
			cdata.comment += `</ul></div>`;
			
			//crear comentario.
			cinterface.createCom(DB, cdata, function(){
				console.log("[MalBot] Creando comentario con la informacion obtenida.");
			}, function(result){
				callback(result);
			});
		}).catch((err) => {
			console.log(err);
		})
	
}

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
	let cparser = require('../api/parser.js');

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

function translateCallback(text, callback){
	translate(text, {from: "en", to: "es"})
		.then((res) => {
			callback(res);
		}).catch((err) => {
			callback(null);
		});
}

module.exports = {commands, check, searchAnime, previewAnime, listAnimes, similarAnimes}