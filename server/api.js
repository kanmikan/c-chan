const sConfig = require('./config/serverConfig');
const dbManager = require('./db/dbManager');
const mdbScheme = require('./db/models/mdbScheme');
const jsonScheme = require('./db/models/jsonScheme');

const utils = require('./utils');
const uploadManager = require('./api/upload');
const parser = require('./api/parser');
const avatar = require('./api/avatar');
const pass = require('./api/passport')

module.exports = function(app){
	
	//RUTA: subida de imagenes
	//TODO: detectar si es un video/imagen/otra cosa y redirigir
	app.post('/api/upload', pass.check, function(req, res) {
		let imgdata = req.files.imgData;
		uploadManager.upload(imgdata, function(result){
			res.json(result);
		});
	})
	
	//RUTA: crea un nuevo box.
	app.post('/api/new', pass.check, pass.checkBoxFields, function(req, res) {
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
		
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {uid: req.session.id}, "", function(userdata){
			json.user.jerarquia = {nick: userdata[0].nick, rango: userdata[0].rango, color: userdata[0].color};
			dbManager.insertDB(req.app.locals.db, "boxs", json, function(){
				res.json({success: true, data: {url: "/tema/" + bid}});
			});
		});
		
	});
	
	//RUTA: nuevo comentario.
	app.post('/api/com', pass.check, pass.checkComFields, function(req, res) {
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
		json.content.body = parser.parseInput(req.app.locals.db, cid, content);
		
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {uid: req.session.id}, "", function(userdata){
			json.user.jerarquia = {nick: userdata[0].nick, rango: userdata[0].rango, color: userdata[0].color};
			dbManager.insertDB(req.app.locals.db, mdbScheme.C_COMS, json, function(){
				//por cuestiones de sincronizacion, tengo que leer la cantidad de comentarios en cada envio de comentario
				dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, {bid: bid}, "", function(coms){
					dbManager.pushDB(req.app.locals.db, mdbScheme.C_BOXS, {bid: bid}, {$set: {"content.comments": coms.length, "date.bump": timestamp}});
				});
				res.json({success: true, data: json});
			});
		});
		
	});
	
	//MUESTRA: obtener todos los boxs, ordenados por ultimo bump y stickys
	//TODO: añadir filtro de datos
	app.get('/api/boxs', pass.check, function(req, res) {
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, "", {sticky: -1, bump: -1}, function(boxs){
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
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, {bid: bid}, {sticky: -1, bump: -1}, function(boxs){
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
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, "", {tiempo: -1}, function(coms){
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
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, {bid: bid}, {tiempo: -1}, function(coms){
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
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, {cid: cid}, {tiempo: -1}, function(coms){
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
			uid: req.session.id,
			nick: "Mikandev",
			rango: "Admin",
			color: "#ff0000",
			pass: "1234",
			token: "",
			permisos: ["admin"],
			state: ["banned"],
			extra: {
				bandata: {
					ip: "127.0.0.1", //cuando alguien es baneado se le loguea la ip junto con el ban, para detectar clones o para asustar cepiteros.
					fecha: 0,
					duracion: 1000,
					razon: "Por mogo"
				}
			}
		};
		
		dbManager.insertDB(req.app.locals.db, "users", data, function(){
			res.redirect("/");
		});
		
	});
	
}