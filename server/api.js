const sConfig = require('./config/serverconfig.js');
const dbManager = require('./db/dbmanager.js');
const mdbScheme = require('./db/models/mdbscheme.js');
const jsonScheme = require('./db/models/jsonscheme.js');
const sesionManager = require('./sesion/sesionmanager.js');
const cfilter = require('./sesion/contentfilter.js');
const rate = require('./sesion/limiter.js');

const utils = require('./utils.js');
const uploadManager = require('./api/upload.js');
const parser = require('./api/parser.js');
const avatar = require('./api/avatar.js');
const pass = require('./api/passport.js');
const live = require('./api/live.js');
const builder = require('./api/builder.js');
const compat = require('./db/compat.js');
const recycler = require('./api/recyclemanager.js');
const moderation = require('./api/moderation.js');
const sanitizer = require('./api/sanitizer.js');
const access = require('./api/access.js');
const yuu = require('./extra/yuubot.js');

module.exports = function(app){
	
	//API: subida de imagenes
	app.post('/api/upload', rate.apiLimit, pass.check, sesionManager.checkSesion, function(req, res) {
		let filedata = req.files.fileData;
		let mimetype = filedata.type.split("/");
	
		if (mimetype[0] === "image"){
			uploadManager.upload(filedata, function(result){
				res.json(result);
			});
		} else if (mimetype[0] === "video"){
			uploadManager.uploadVid(filedata, function(result){
				res.json(result);
			});
		} else {
			res.json({success: false, data: "formato no admitido."});
		}
		
	});
	
	//API: manipulacion de urls
	app.post('/api/uplink', rate.apiLimit, pass.check, sesionManager.checkSesion, function(req, res) {
		let link = req.fields.link;
		uploadManager.uploadLink(link, function(result){
			res.json(result);
		});
	});
	
	//RUTA: crea un nuevo box.
	app.post('/api/new', rate.spamLimit, access.boxs, pass.check, pass.checkBoxFields, sesionManager.checkSesion,  async function(req, res) {
		let cat = req.fields.cat;
		let title = req.fields.title;
		let subtitle = req.fields.subtitle;
		let content = req.fields.content;
		let img = req.fields.img.split(";");
		let vid = req.fields.vid.split(";");
		let pollOne = req.fields.pollOne;
		let pollTwo = req.fields.pollTwo;
		let pollAsk = req.fields.pollAsk;
		
		//checkboxes de las opciones.
		let modAnonimo = (req.fields.modAnon) ? true : false;
		let dados = (req.fields.dados) ? true : false;
		let idunico = (req.fields.idunico) ? true : false;
		let vidsync = (req.fields.vidsync) ? true : false;
		
		let time = Date.now();
		let bid = title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").substr(0,80) + utils.uuidv4().split("-")[0];
	
		//clonar el esquema json de un box.
		let json = utils.clone(jsonScheme.BOX_SCHEME);
		
		//asignar datos del nuevo box.
		json.bid = bid;
		json.cat = (cat != "") ? cat : "off";
		json.user.uid = req.session.uid;
		json.date.created = time;
		json.date.bump = time;
		
		if (sConfig.ENABLE_POSTS && vid[0] === ""){
			//fuerza el formato de posts, solo si no es un post donde se eligió un video para mostrar.
			let imglist = parser.parseImgTags(content);
			//si hay al menos 1 elemento, usar el formato de post
			if (imglist[0]){
				json.type.push("post");
				json.content.extra.post = {
					images: imglist
				}
			}
		}
		
		//detecta y configura si es un box con imagen o con un video
		if (img[0] != "" && (sConfig.IMG_SERVER != 9)){
			json.type.push("image");
			json.img.full = img[0];
			json.img.preview = img[1];
		} else if (vid[0] != "" && (sConfig.VIDEO_SERVER != 9 || vid[0].search("youtube") != -1)){
			json.type.push("video");
			json.media.raw = vid[0];
			json.media.preview = vid[1];
		}
		
		//tipo especial de box de videos sincronizados
		if (vidsync) {
			json.flag.push("sync");
		}
		
		json.content.title = sanitizer.sanitizeAll(title);
		json.content.body = parser.parseBoxInput(req.app.locals.db, bid, req.session.uid, content);
		
		if (subtitle != ""){json.content.extra.title2 = sanitizer.sanitizeAll(subtitle);}
		if (dados){json.type.push("dice");}
		if (idunico){json.type.push("idunico");}
		
		//deteccion y configuracion de box de encuestas.
		if (pollOne != "" && pollTwo != ""){
			console.log(pollAsk);
			json.type.push("poll");
			json.content.extra.poll = {
				pollOne: sanitizer.sanitizeAll(pollOne),
				pollOneV: 0,
				pollTwo: sanitizer.sanitizeAll(pollTwo),
				pollTwoV: 0,
				pollVotes: [],
				pollAsk: pollAsk,
				pollDate: time,
				pollEnds: 0
			};
		} else {
			json.content.extra.poll = {};
		}
		
		//detectar opcion de anonimato para los usuarios con rango.
		let userdata = sesionManager.getUserData(req.session.id);
		if (userdata[0] && !modAnonimo){
			json.user.jerarquia = {nick: userdata[0].data.nick, rango: userdata[0].data.rango, color: userdata[0].data.color};
		}
		
		//reciclar ultimo tema sin bump de la categoria asincronicamente
		recycler.recycle(req.app.locals.db, cat);
		
		//actualizar orden de las categorias asincronicamente
		dbManager.pushDB(req.app.locals.db, mdbScheme.C_CATS, {catid: cat}, {$set: {"date.order": time}}, function(){});
		
		//insertar nuevo tema en la base de datos y actualizar
		dbManager.insertDB(req.app.locals.db, "boxs", json, function(){
			//informar nueva actividad.
			let protectedJSON = pass.filterProtectedUID(json);
			live.sendData("new", {kind: "newbox", data: protectedJSON});
			live.sendData("activity", {kind: "box", data: protectedJSON});
			
			//devolver la url del nuevo tema creado.
			res.json({success: true, data: {url: "/" + cat + "/" + bid}});
		});
		
	});
	
	//RUTA: nuevo comentario.
	app.post('/api/com', rate.spamLimit, access.coms, pass.check, pass.checkComFields, sesionManager.checkSesion, async function(req, res) {
		let bid = req.fields.bid;
		let content = req.fields.content;
		let img = req.fields.img.split(";");
		let vid = req.fields.vid.split(";");
		let cid = utils.genCID(7);
		let timestamp = Date.now();
		let DB = req.app.locals.db;
		let token = req.fields.token;
		let modAnonimo = (req.fields.modAnon) ? true : false;
		let pollc = (req.fields.pollc === "1") ? true : false;
		
		//clonar el esquema json de los comentarios.
		let json = utils.clone(jsonScheme.COMMENT_SCHEME);
		
		//asignar datos del nuevo comentario, el procedimiento es similar al de los temas.
		json.cid = cid;
		json.bid = bid;
		json.user.uid = req.session.uid;
		json.date.created = timestamp;
		
		if (img[0] != "" && (sConfig.IMG_SERVER != 9)){
			json.type.push("image");
			json.img.full = img[0];
			json.img.preview = img[1];
		} else if (vid[0] != "" && (sConfig.VIDEO_SERVER != 9 || vid[0].search("youtube") != -1)){
			json.type.push("video");
			json.media.raw = vid[0];
			json.media.preview = vid[1];
		}
		json.content.body = parser.parseComInput(DB, bid, cid, req.session.uid, content);
		
		let userdata = sesionManager.getUserData(req.session.id);
		if (userdata[0] && !modAnonimo){
			json.user.jerarquia = {nick: userdata[0].data.nick, rango: userdata[0].data.rango, color: userdata[0].data.color};
		}
		
		//se actualiza el contador de la cantidad de comentarios en el tema.
		let coms = await dbManager.queryDB(DB, mdbScheme.C_COMS, {bid: bid}, "", () => {});
		await dbManager.pushDB(DB, mdbScheme.C_BOXS, {bid: bid}, {$set: {"content.comments": coms.length+1, "date.bump": timestamp}});
		
		//se lee el box al que pertenece el comentario
		let box = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: bid}, "", () => {});
		if (box[0]){
			//deteccion del op, en base a la uid del solicitante.
			let op = (box[0].user.uid === req.session.uid) ? true : false;
			
			/* modificador de anons */
			json.icon = avatar.genAnon(box[0].type);
			
			/* modificador de idunico */
			if (box[0].type.includes("idunico")){
				let idu = utils.xmur3(req.session.uid+bid)();
				let colorid = utils.genColor(req.session.uid+bid);
				json.type.push("idunico");
				json.content.extra.idunico = {
					id: idu,
					color: colorid
				}
			}
			
			/* modificador de encuesta */
			if (pollc){
				json.type.push("poll");
				let poll = box[0].content.extra.poll;
				let voted = poll.pollVotes.filter(item => item.uid === req.session.uid)[0];
				if (voted){
					json.content.extra.poll = {
						voted: true,
						optionId: parseInt(voted.option),
						optionText: (voted.option === "1") ? poll.pollOne : poll.pollTwo
					}
				}
			}
			
			//enviar comentario via socket
			let protectedJSON = pass.filterProtectedUID(json);
			live.sendDataTo(bid, "comment", {token: token, op: op, data: protectedJSON});
			
			//enviar señal de nueva actividad a todos
			live.sendData("activity", {kind: "comment", data: protectedJSON});
			
			/* Notificar al dueño del box, si no es el solicitante */
			if (!op){	
				let notifdata = builder.notification({
					suid: req.session.uid,
					ruid: box[0].user.uid,
					cid: cid,
					bid: bid,
					tag: false,
					title: sanitizer.sanitizeAll(box[0].content.title),
					desc: sanitizer.sanitizeAll(json.content.body),
					thumb: (box[0].type.includes("video")) ? box[0].media.preview : box[0].img.preview
				});
				
				//escribe la notificacion en la base de datos.
				await dbManager.insertDB(DB, mdbScheme.C_NOTIF, notifdata, function(){});
				//envia la notificacion push, suponiendo que el receptor esté online.
				live.sendDataTo(box[0].user.uid, "notif", pass.filterProtectedUID(notifdata));
			}
			/* fin de notificacion */
		}
		
		//guarda el comentario en la base de datos y envia una notificacion de nueva actividad.
		live.sendData("new", {kind: "newcom", data: pass.filterProtectedUID(json)});
		await dbManager.insertDB(DB, mdbScheme.C_COMS, json, () => {});
		
		//invocar al yuubot para que analize el comentario
		yuu.modCom(cid, req);
		
		res.json({success: true, data: json});
	});
	
	//API: login de ID
	//TODO añadir middleware de passport para comprobar la validez de los campos.
	app.post('/api/idlogin', rate.loginLimit, access.login, async function(req, res){
		let userid = (req.fields.userid.trim() === "") ? req.session.uid : req.fields.userid.trim();
		
		//leer la base de datos de IDs filtrando al uid en cuestion
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {uid: userid}, "", async function(user){
			if (user[0]){
				//comprobar si el userid tiene contraseña, en cuyo caso redirigir al modal de login.
				//TODO: mostrar boton de contraseña en el mismo modal?
				if (user[0].pass.trim() !== ""){
					res.json({success: false, data: "UID protegido, dirijase al login."});
				} else {
					//aplicar usuario a la sesion actual.
					await dbManager.pushDB(req.app.locals.db, mdbScheme.C_ADM, {uid: user[0].uid}, {$set: {sid: req.session.id}});
					req.session.uid = user[0].uid;
					req.session.config = user[0].extra.config;
					
					//invalidar caché local del usuario para actualizar sus datos.
					sesionManager.disposeUserCache(req.session.id);
					console.log("[Sesion] Usuario logeado.");
					res.json({success: true, data: "logueado."});
				}
			} else {
				//si el usuario no existe, generar uno nuevo.
				//comprobar que el userid sea un id valido de 32 caracteres.
				if (userid.trim().length !== 32){
					res.json({success: false, data: "ID invalido, tiene que tener 32 caracteres."});
				} else {
					//generar nuevo usuario.
					let json = sesionManager.genUser(userid, "", req.session.id);
					dbManager.insertDB(req.app.locals.db, mdbScheme.C_ADM, json, function(response){
						req.session.uid = json.uid;
						req.session.config = json.extra.config;
						sesionManager.disposeUserCache(req.session.id);
					});
					console.log("[Sesion] Usuario creado.");
					res.json({success: true, data: json});
				}
			}
		});
		
	});
	

	
	//MUESTRA: obtener todos los boxs, ordenados por ultimo bump y stickys
	//TODO: añadir filtro de datos
	app.get('/api/boxs', rate.apiLimit, pass.check, function(req, res) {
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, "", {"date.sticky": -1, "date.bump": -1}, function(boxs){
			if (boxs[0] != undefined){
				boxs = cfilter.filterBoxHides(boxs, req.session.config);
				res.json({success: true, data: pass.filterProtectedUID(boxs)});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener boxs por la categoria.
	app.get('/api/boxs/:cat', rate.apiLimit, pass.check, function(req, res) {
		let cat = req.params.cat;
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, {cat: cat}, {"date.sticky": -1, "date.bump": -1}, function(boxs){
			if (boxs[0]){
				boxs = cfilter.filterBoxHides(boxs, req.session.config);
				res.json({success: true, data: pass.filterProtectedUID(boxs)});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener box especificado con el bid.
	app.get('/api/box/:bid', rate.apiLimit, pass.check, function(req, res) {
		let bid = req.params.bid;
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, {bid: bid}, {"date.sticky": -1, "date.bump": -1}, function(boxs){
			if (boxs[0]){
				res.json({success: true, data: pass.filterProtectedUID(boxs)});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//API: obtener boxs de x categoria desde un bid especifico
	app.get('/api/box/:index/:kind', rate.apiLimit, pass.check, function(req, res){
		let index = req.params.index;
		let kind = req.params.kind;
		let db = req.app.locals.db;
		
		let criterio = (kind === "home") ? {} : {cat: kind};
		let orden = (kind === "home") ? {"date.sticky": -1, "date.bump": -1} : {"date.sticky": -1, "date.csticky": -1, "date.bump": -1};
		
		dbManager.queryDB(db, mdbScheme.C_BOXS, criterio, orden, function(boxs){
			if (boxs[0]){
				let indice = 0;
				for (var i=0; i<boxs.length; i++){
					if (boxs[i].bid === index){
						indice = i;
						break;
					}
				}
				let desde = indice+1;
				let hasta = sConfig.HOME_BOX_PAGELOAD;
				
				//filtrar contenido oculto
				let filteredBoxs = cfilter.filterBoxHides(boxs, req.session.config);
				//dividir array desde hasta
				let limitedBoxs = filteredBoxs.slice(desde, desde+hasta);
				if (limitedBoxs[0]){
					res.json({success: true, data: pass.filterProtectedUID(limitedBoxs)});
				} else {
					res.json({success: false, data: null});
				}
				
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//API: controla y redirige las notificaciones
	app.get('/api/ntf/:bid/:cid', rate.apiLimit, async function(req, res) {
		let bid = req.params.bid;
		let cid = req.params.cid;
		let uid = req.session.uid;
		//limpiar notificaciones
		await dbManager.deleteDB(req.app.locals.db, mdbScheme.C_NOTIF, {"receiver.uid": uid, "content.bid": bid, "content.tag": false}, ()=>{});
		await dbManager.deleteDB(req.app.locals.db, mdbScheme.C_NOTIF, {"receiver.uid": uid, "content.bid": bid, "content.cid": cid, "content.tag": true}, ()=>{});
		
		if (bid === "msg"){
			res.redirect("/");
		} else {
			res.redirect("/tema/" + bid + "#" + cid);
		}
	});
	
	//API: elimina todas las notificaciones
	app.get('/api/ntf/clear', rate.apiLimit, async function(req, res) {
		let bid = req.params.bid;
		let cid = req.params.cid;
		let uid = req.session.uid;
		//limpiar notificaciones
		await dbManager.deleteDB(req.app.locals.db, mdbScheme.C_NOTIF, {"receiver.uid": uid}, ()=>{});
		res.send({sucess: true, data: null});
		
	});
	
	//API: obtener una notificacion especificada por el timestamp, usada por el popup.
	app.get('/api/notifs/:date', rate.apiLimit, function(req, res) {
		let uid = req.session.uid;
		let date = req.params.date;
		
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_NOTIF, {"receiver.uid": uid, "date.created": Number(date)}, {"date.created": -1}, function(ntf){
			if (ntf[0]){
				res.send({success: true, data: ntf[0]});
			} else {
				res.send({success: false, data: null});
			}
		});
		
	});
	
	//API: obtener todos los comentarios
	app.get('/api/coms', rate.apiLimit, pass.check, function(req, res) {
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, "", {"date.created": -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: pass.filterProtectedUID(coms)});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//API: obtener todos los comentarios en base al bid
	app.get('/api/coms/:bid', rate.apiLimit, pass.check, function(req, res) {
		let bid = req.params.bid;
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, {bid: bid}, {"date.created": -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: pass.filterProtectedUID(coms)});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//API: obtener todos los comentarios en base a la categoria
	app.get('/api/categorycoms/:cat/:limit', rate.apiLimit, pass.check, async function(req, res) {
		let cat = req.params.cat;
		let limit = (req.params.limit) ? parseInt(req.params.limit) : 0;
		let filter = (cat === "home") ? "" : {cat: cat};
		let comfilter = [];
		
		//leer boxs de x categoria
		let boxs = await dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, filter, "", function(){});
		boxs.forEach(function(box){
			comfilter.push({bid: box.bid});
		});
		
		//filtrar comentarios en base a esos boxs.
		if (comfilter.length > 0){
			dbManager.queryDBSkip(req.app.locals.db, mdbScheme.C_COMS, {$or: comfilter}, {"date.created": -1}, 0, limit, function(coms){
				if (coms[0] != undefined){
					res.json({success: true, data: pass.filterProtectedUID(coms)});
				} else {
					res.json({success: false, data: null});
				}
			});
		} else {
			//todo: enviar que no hay comentarios y mostrar mensaje.
			res.json({success: false, data: null});
		}
	});
	
	//API: obtener comentario especificado con el cid
	app.get('/api/com/:cid', rate.apiLimit, pass.check, function(req, res) {
		let cid = req.params.cid;
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, {cid: cid}, {"date.created": -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: pass.filterProtectedUID(coms)});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//API: manejo de votos en las encuestas
	//TODO: placeholder
	app.post('/api/poll', rate.spamLimit, pass.check, sesionManager.checkSesion, async function(req, res) {
		let option = req.fields.vote;
		let bid = req.fields.bid;
		let timestamp = Date.now();
		let uid = req.session.uid;
		//let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
		
		//leer informacion de la encuesta.
		let boxs = await dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, {bid: bid}, "", function(){});
		let votos = boxs[0].content.extra.poll.pollVotes;
		let vfilt = votos.filter(item => item.uid === uid);
		
		if (vfilt[0]){
			res.json({success: false, data: "Ya votaste."});
		} else {
			//escribir nueva info en la encuesta.
			let nuevoVoto = {uid: uid, timestamp: timestamp, option: option};
			votos.push(nuevoVoto);
			
			await dbManager.pushDB(req.app.locals.db, mdbScheme.C_BOXS, {bid: bid}, {$push: {"content.extra.poll.pollVotes": nuevoVoto}});
			
			//calcular y hacer emit de la nueva info de votos.
			let pollOneV = votos.filter(item => item.option === "1").length;
			let pollTwoV = votos.filter(item => item.option === "2").length;
			let pollData = utils.getPollPercent(pollOneV, pollTwoV);
			
			live.sendDataTo(bid, "vote", {option: option, pollData: pollData});
			res.json({success: true, data: {option: option, pollData: pollData}});
		}
	});
	
	//API: modificar las preferencias del usuario.
	app.post('/api/config', rate.apiLimit, pass.check, sesionManager.checkSesion, function(req, res) {
		let data = req.fields.data;
		let options = data.split(":");
		let sesiondata = sesionManager.getUserData(req.session.id)[0].data;
		
		//TODO: sanitizar inputs.
		
		
		//manipular opciones.
		if (options[0]){
			let subopt = options[0].split("_");
			if (subopt[1]){
				switch(subopt[1]){
					case "add":
						//calcular si ya existe e ignorar si es asi.
						if (!req.session.config[subopt[0]].includes(options[1])){
							req.session.config[subopt[0]].push(options[1]);
							sesiondata.extra.config[subopt[0]].push(options[1]);
						} else {
							return res.json({success: false, data: "dato invalido."});
						}
						break;
					case "del":
						//aca no es necesario calcular si existe, porque si no existe simplemente no afecta al resultado.
						let tmpconf = req.session.config[subopt[0]];
						tmpconf = tmpconf.filter(item => item != options[1]);
						
						req.session.config[subopt[0]] = tmpconf;
						sesiondata.extra.config[subopt[0]] = tmpconf;
						break;
				}
			} else {
				//se asume que es una reasignacion común
				//unir options despues del primer split.
				let fullvalue = options.splice(1).join(":");
				//detectar y convertir booleanos
				if (fullvalue === "true"){fullvalue = true;}
				if (fullvalue === "false"){fullvalue = false;}
				
				if (!req.session.config){req.session.config = {};}
				if (!sesiondata.extra.config){sesiondata.extra.config = {};}
				req.session.config[options[0]] = fullvalue;
				sesiondata.extra.config[options[0]] = fullvalue;
			}
			//guardar info en el usuario.
			dbManager.pushDB(req.app.locals.db, mdbScheme.C_ADM, {sid: req.session.id}, {$set: {"extra.config": sesiondata.extra.config}}, function(resp){});
		}
		res.send({success: true, data: req.session.config});
	});
	
	//API: denuncias
	app.post('/api/report', rate.spamLimit, pass.check, sesionManager.checkSesion, function(req, res) {
		let kind = req.fields.kind;
		let razon = req.fields.razon;
		
		switch (kind){
			case "comment":
				//reportar comentario
				let cid = req.fields.cid;
				let creport = {
					suid: req.session.uid,
					cid: cid,
					bid: "",
					isBox: false,
					razon: razon
				};
				moderation.sendADMFlag(req.app.locals.db, creport, function(resp){
					res.send(resp);
				});
				break;
			case "box":
				//reportar box
				let bid = req.fields.bid;
				let breport = {
					suid: req.session.uid,
					cid: "0",
					bid: bid,
					isBox: true,
					razon: razon
				};
				moderation.sendADMFlag(req.app.locals.db, breport, function(resp){
					res.send(resp);
				});
				break;
			default:
				res.send({success: false, data: "Reporte invalido."});
				break;
		}
	});
	
}