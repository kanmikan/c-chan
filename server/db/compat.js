/* Herramientas de compatibilidad entre versiones de la base de datos */
const utils = require('../utils');
const jsonScheme = require('./models/jsonScheme');
const upload = require('../api/upload');

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
					preview: upload.genThumb(mdbElement.img),
					full: mdbElement.img,
					raw: ""
				};
			}
			if (mdbElement.video_url != "" && mdbElement.video){
				json.type.push("video");
				if (upload.checkURLType(mdbElement.video_url) === "youtube-embed"){
					json.img.preview = upload.genYoutubeThumb(mdbElement.video_url, "mq");
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
			json.icon = "/assets/anon/" + mdbElement.color;
			if (mdbElement.img && !mdbElement.video){
				json.type.push("image");
				json.img = {
					preview: upload.genThumb(mdbElement.img_url),
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

module.exports = {checkCompat}