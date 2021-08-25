const sConfig = require('./config/serverConfig');
const dbManager = require('./db/dbManager');
const mdbScheme = require('./db/models/mdbScheme');
const jsonScheme = require('./db/models/jsonScheme');

const utils = require('./utils');
const uploadManager = require('./api/upload');
const parser = require('./api/parser');
const avatar = require('./api/avatar');
const pass = require('./api/passport')

module.exports = function(app, DB){
	
	//RUTA: subida de imagenes
	//TODO: detectar si es un video/imagen/otra cosa y redirigir
	app.post('/api/upload', pass.check, function(req, res) {
		let imgdata = req.files.imgData;
		uploadManager.upload(imgdata, function(result){
			res.json(result);
		});
	})
	
	//RUTA: crea un nuevo box.
	app.post('/api/new', pass.check, function(req, res) {
		let cat = req.fields.cat;
		let title = req.fields.title;
		let subtitle = req.fields.subtitle;
		let content = req.fields.content;
		let img = req.fields.img.split(";");
		let vid = req.fields.vid.split(";");
		let pollOne = req.fields.pollOne;
		let pollTwo = req.fields.pollTwo;
		
		let time = Date.now();
		let bid = utils.uuidv4();
		let json = utils.clone(jsonScheme.BOX_SCHEME);
		json.bid = bid;
		json.cat = (cat != "") ? cat : "off";
		json.user.uid = req.session.id;
		json.date.created = time;
		json.date.bump = time;
		
		if (img[0] != ""){
			json.type.push("image");
			json.img.full = img[0];
			json.img.preview = img[1];
		} else if (vid[0] != ""){
			json.type.push("video");
			json.media.raw = vid[0];
			json.media.preview = vid[1];
		}
		
		json.content.title = title;
		json.content.body = content;
		if (pollOne != "" && pollTwo != ""){
			json.type.push("poll");
			json.content.extra.poll = {
				pollOne: pollOne,
				pollOneV: 0,
				pollTwo: pollTwo,
				pollTwoV: 0,
				pollVotes: []
			};
		} else {
			json.content.extra.poll = {};
		}
		
		dbManager.insertDB(DB, "boxs", json, function(){
			res.json({success: true, data: {url: "/tema/" + bid}});
		});
		
	});
	
	//RUTA: nuevo comentario.
	app.post('/api/com', pass.check, function(req, res) {
		let bid = req.fields.bid;
		let content = req.fields.content;
		let img = req.fields.img.split(";");
		let vid = req.fields.vid.split(";");
		let cid = utils.genCID(7);
		let timestamp = Date.now();
		
		let json = utils.clone(jsonScheme.COMMENT_SCHEME);
		json.cid = cid;
		json.bid = bid;
		json.user.uid = req.session.id;
		json.date.created = timestamp;
		json.icon = avatar.genAnon();
		if (img[0] != ""){
			json.type.push("image");
			json.img.full = img[0];
			json.img.preview = img[1];
		} else if (vid[0] != ""){
			json.type.push("video");
			json.media.raw = vid[0];
			json.media.preview = vid[1];
		}
		json.content.body = parser.parseInput(DB, cid, content);
		
		//por cuestiones de sincronizacion, tengo que leer la cantidad de comentarios en cada envio de comentario
		
		dbManager.insertDB(DB, mdbScheme.C_COMS, json, function(){
			dbManager.queryDB(DB, mdbScheme.C_COMS, {bid: bid}, "", function(coms){
				dbManager.pushDB(DB, mdbScheme.C_BOXS, {bid: bid}, {$set: {"content.comments": coms.length, "date.bump": timestamp}});
			});
			res.json({success: true, data: json})
		});
		
	});
	
	//MUESTRA: obtener todos los boxs, ordenados por ultimo bump y stickys
	//TODO: añadir filtro de datos
	app.get('/api/boxs', pass.check, function(req, res) {
		dbManager.queryDB(DB, mdbScheme.C_BOXS, "", {sticky: -1, bump: -1}, function(boxs){
			if (boxs[0] != undefined){
				res.json({success: true, data: boxs});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener box especificado con el bid.
	app.get('/api/box/:bid', pass.check, function(req, res) {
		let bid = req.params.bid;
		dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: bid}, {sticky: -1, bump: -1}, function(boxs){
			if (boxs[0] != undefined){
				res.json({success: true, data: boxs});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener todos los comentarios
	//TODO: añadir filtro de datos
	app.get('/api/coms', pass.check, function(req, res) {
		dbManager.queryDB(DB, mdbScheme.C_COMS, "", {tiempo: -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: coms});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener todos los comentarios en base al bid
	//TODO: añadir filtro de datos
	app.get('/api/coms/:bid', pass.check, function(req, res) {
		let bid = req.params.bid;
		dbManager.queryDB(DB, mdbScheme.C_COMS, {bid: bid}, {tiempo: -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: coms});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener comentario especificado con el cid
	app.get('/api/com/:cid', pass.check, function(req, res) {
		let cid = req.params.cid;
		dbManager.queryDB(DB, mdbScheme.C_COMS, {cid: cid}, {tiempo: -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: coms});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//DEBUG: MUESTRA DE LA ESTRUCTURA DE LOS TEMAS EN MIKANDBV2
	//SOLO PARA DEBUG Y TEST, ESTO LO VOY A SACAR
	app.get('/dev', function(req, res) {
		
		let data = {
			bid: utils.uuidv4(),
			cat: "oficial",
			user: {
				uid: "uid",
				jerarquia: "" //datos incrustados de jerarquia.
			},
			type: [ //poll, dice, video, object
				"poll"
			],
			flag: [ //rss
				"rss"
			],
			date: {
				created: 0, //timestamp de fecha de creacion.
				bump: 0, //timestamp de ultimo bump.
				sticky: 0, //me olvide de añadir estos..
				csticky: 0
			},
			img: {
				preview: "/assets/logo.png", //version optimizada de la imagen para uso como thumbnail.
				full: "/assets/logo.png", //imagen original subida en un servidor local.
				raw: "" //imagen original del sitio procedente, si existe.
			},
			media: {
				preview: "", //thumbnail del video/multimedia
				raw: "" //link directo al video/multimedia
			},
			content: { //contenido del tema.
				title: "title",
				body: "contenido",
				comments: 0, //se incrusta una referencia de la cantidad de comentarios en el box.
				extra: { //datos especiales dependiendo del tipo de box.
					title2: "title2", //segundo titulo, caracteristica unica de mikanchan
					poll: { //datos extra perteneciente a una encuesta.
						pollOne: "opcion 1",
						pollOneV: 0,
						pollTwo: "opcion 2",
						pollTwoV: 0,
						pollVotes: [ //los votos de la encuesta se almacenan en el mismo box.
							["uid", 1],
							["uid", 2]
						]
					}
				}
			}
		};
		dbManager.insertDB(DB, "boxs", data, function(){
			res.redirect("/");
		});
		
	});
	
}