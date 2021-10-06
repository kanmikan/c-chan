/* Herramientas de compatibilidad entre versiones de la base de datos */
const utils = require('../utils');
const jsonScheme = require('./models/jsonscheme.js');
const upload = require('../api/upload.js');
const youtube = require('../api/youtube.js');

//FUNCION: comprueba la version de la coleccion y transcribe los elementos mdb a mdbv2.
function checkCompat(type, collection){
	let ncollection = new Array();
	for (var i=0; i<collection.length; i++){
		if (!collection[i].version && !collection[i].media){
			ncollection[i] = mdbTranscript(type, collection[i]);
		} else {
			ncollection[i] = collection[i];
		}
	}
	return ncollection;
}

//FUNCION: transcribe un elemento de tipo mdb a mdbv2
function mdbTranscript(type, mdbElement){
	let json;
	switch(type){
		case "BOX":
			json = utils.clone(jsonScheme.BOX_SCHEME);
			json.version = 2;
			json.bid = mdbElement.bid;
			json.cat = mdbElement.cat;
			json.user.uid = mdbElement.uid;
			//json.user.jerarquia = {}
			json.date = {
				created: mdbElement.fecha,
				bump: mdbElement.bump,
				sticky: mdbElement.sticky,
				csticky: mdbElement.csticky || 0
			};
			if (mdbElement.img != "" && !mdbElement.video){
				json.type.push("image");
				json.img = {
					preview: imgTranscript(mdbElement.img),
					full: mdbElement.img,
					raw: ""
				};
			}
			if (mdbElement.video_url != "" && mdbElement.video){
				json.type.push("video");
				if (upload.checkURLType(mdbElement.video_url) === "youtube-embed"){
					json.img.preview = youtube.genYoutubeThumb(mdbElement.video_url, "mq");
				} else {
					json.img.preview = upload.genThumb(mdbElement.video_url);
				}
				json.media = {
					preview: upload.genThumb(mdbElement.video_url),
					raw: mdbElement.video_url
				};
			}
			json.content.title = mdbElement.title;
			json.content.body = mdbElement.content;
			json.content.comments = mdbElement.comments;
			
			//TODO: mas cosas..
			return json;
		case "COM":
			json = utils.clone(jsonScheme.COMMENT_SCHEME);
			json.version = 2;
			json.cid = mdbElement.cid;
			json.bid = mdbElement.bid;
			json.user.uid = mdbElement.uid;
			//jerarquia
			json.date.created = mdbElement.tiempo;
			json.icon = iconTranscript(mdbElement.color);
			if (mdbElement.img && !mdbElement.video){
				json.type.push("image");
				json.img = {
					preview: imgTranscript(mdbElement.img_url),
					full: mdbElement.img_url,
					raw: ""
				};
			}
			if (mdbElement.video && !mdbElement.img){
				json.type.push("video");
				json.media = {
					preview: upload.genThumb(mdbElement.video_url),
					raw: mdbElement.video_url
				};
			}
			json.content.body = mdbElement.texto;
			json.content.extra.tags = mdbElement.tags;
		
			//TODO: mas cosas.
			return json;
	}
	
}

function imgTranscript(url){
	return upload.genThumb(url);
}

function iconTranscript(iconElement){
	let iconE = iconElement.split(",");
	if (iconE[1] != undefined){
		return `ico,${iconE[1]},${iconE[0]}`;
	} else {
		//convertir anons del viejo formato al nuevo.
		let ico = iconElement.split("/");
		let out = ico[ico.length-1].split(".");
		switch(out[0]){
			case "1":
				//amarillo
				return "ico,#FFcc00,#ffffff";
			case "2":
				//azul
				return "ico,#0579b3,#ffffff";
			case "3":
				//verde
				return "ico,#02b13c,#ffffff";
			case "4":
				//rojo
				return "ico,#df0202,#ffffff";
			case "5":
				//multi
				return "class,anonMulti,white";
			case "6":
				//invertido
				return "class,anonInvertido,white";
			case "7":
				//black
				return "ico,#000000,#ffffff";
			case "8":
				//uff
				return "/assets/anon/8.png";
			case "9":
				//white
				return "ico,#ffffff,#000000";
		}
		
		return iconElement;
	}
	
}

module.exports = {checkCompat}