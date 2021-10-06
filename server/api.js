const sConfig = require('./config/serverconfig.js');
const dbManager = require('./db/dbmanager.js');
const mdbScheme = require('./db/models/mdbscheme.js');
const jsonScheme = require('./db/models/jsonscheme.js');
const sesionManager = require('./sesion/sesionmanager.js');
const cfilter = require('./sesion/contentfilter.js');

const utils = require('./utils.js');
const uploadManager = require('./api/upload.js');
const parser = require('./api/parser.js');
const avatar = require('./api/avatar.js');
const pass = require('./api/passport.js');
const live = require('./api/live.js');
const compat = require('./db/compat.js');
const recycler = require('./api/recyclemanager.js');

module.exports = function(app){
	
	//API: subida de imagenes
	app.post('/api/upload', pass.check, sesionManager.checkSesion, function(req, res) {
		let filedata = req.files.fileData;
		let mimetype = filedata.type.split("/");
		let size = filedata.size;
		if (size > sConfig.UPLOAD_MAX_SIZE){
			res.json({success: false, data: `Archivo muy grande, máximo ${utils.formatBytes(sConfig.UPLOAD_MAX_SIZE)}`});
		} else {
			if (mimetype[0] === "image"){
				uploadManager.upload(filedata, function(result){
					console.log(result);
					res.json(result);
				});
			} else if (mimetype[0] === "video"){
				uploadManager.uploadVid(filedata, function(result){
					res.json(result);
				});
			} else {
				res.json({success: false, data: "formato no admitido."});
			}
		}
	});
	
	//API: manipulacion de urls
	app.post('/api/uplink', pass.check, sesionManager.checkSesion, function(req, res) {
		let link = req.fields.link;
		uploadManager.uploadLink(link, function(result){
			res.json(result);
		});
	});
	
	//RUTA: crea un nuevo box.
	app.post('/api/new', pass.check, pass.checkBoxFields, sesionManager.checkSesion,  async function(req, res) {
		let cat = req.fields.cat;
		let title = req.fields.title;
		let subtitle = req.fields.subtitle;
		let content = req.fields.content;
		let img = req.fields.img.split(";");
		let vid = req.fields.vid.split(";");
		let pollOne = req.fields.pollOne;
		let pollTwo = req.fields.pollTwo;
		//checkboxes
		let dados = (req.fields.dados) ? true : false;
		let idunico = (req.fields.idunico) ? true : false;
		
		let time = Date.now();
		let bid = utils.uuidv4();
		let json = utils.clone(jsonScheme.BOX_SCHEME);
		json.bid = bid;
		json.cat = (cat != "") ? cat : "off";
		json.user.uid = req.session.uid;
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
		json.content.body = parser.htmlSanitize(content);
		
		if (subtitle != ""){json.content.extra.title2 = subtitle;}
		if (dados){json.type.push("dice");}
		if (idunico){json.type.push("idunico");}
		
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
		
		let userdata = sesionManager.getUserData(req.session.id);
		if (userdata[0]){json.user.jerarquia = {nick: userdata[0].data.nick, rango: userdata[0].data.rango, color: userdata[0].data.color};}
		
		//reciclar temas asincronicamente
		recycler.recycle(req.app.locals.db, cat);
		
		//actualizar orden de las categorias asincronicamente
		dbManager.pushDB(req.app.locals.db, mdbScheme.C_CATS, {catid: cat}, {$set: {"date.order": time}}, function(){});
		
		dbManager.insertDB(req.app.locals.db, "boxs", json, function(){
			live.sendData("new", {kind: "newbox", data: pass.filterProtectedUID(json)});
			res.json({success: true, data: {url: "/tema/" + bid}});
		});
	});
	
	//RUTA: nuevo comentario.
	app.post('/api/com', pass.check, pass.checkComFields, sesionManager.checkSesion, async function(req, res) {
		let bid = req.fields.bid;
		let content = req.fields.content;
		let img = req.fields.img.split(";");
		let vid = req.fields.vid.split(";");
		let cid = utils.genCID(7);
		let timestamp = Date.now();
		let DB = req.app.locals.db;
		let token = req.fields.token;
		
		let json = utils.clone(jsonScheme.COMMENT_SCHEME);
		json.cid = cid;
		json.bid = bid;
		json.user.uid = req.session.uid;
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
		json.content.body = parser.parseComInput(DB, cid, req.session.uid, content);
		
		let userdata = sesionManager.getUserData(req.session.id);
		if (userdata[0]){json.user.jerarquia = {nick: userdata[0].data.nick, rango: userdata[0].data.rango, color: userdata[0].data.color};}
		
		let coms = await dbManager.queryDB(DB, mdbScheme.C_COMS, {bid: bid}, "", () => {});
		await dbManager.pushDB(DB, mdbScheme.C_BOXS, {bid: bid}, {$set: {"content.comments": coms.length+1, "date.bump": timestamp}});
		
		let box = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {bid: bid}, "", () => {});
		if (box[0]){
			let op = (box[0].user.uid === req.session.uid) ? true : false;
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
			
			//enviar comentario via socket
			let protectedJSON = pass.filterProtectedUID(json);
			live.sendDataTo(bid, "comment", {token: token, op: op, data: protectedJSON});
			//enviar señal de nueva actividad a todos
			live.sendData("activity", {kind: "comment", data: protectedJSON});
			
			/* Notificar al dueño del box, si no es el mismo que comenta kjj */
			if (!op){
				let notifdata = utils.clone(jsonScheme.NOTIF_SCHEME);
				notifdata.sender.uid = req.session.uid;
				notifdata.receiver.uid = box[0].user.uid;
				notifdata.date.created = timestamp;
				notifdata.state.push("new");
				notifdata.content.cid = cid;
				notifdata.content.bid = bid;
				notifdata.content.preview = {
					title: box[0].content.title,
					desc: json.content.body,
					thumb: box[0].img.preview
				}
				await dbManager.insertDB(DB, mdbScheme.C_NOTIF, notifdata, function(){});
				live.sendDataTo(box[0].user.uid, "notif", pass.filterProtectedUID(notifdata));
			}
			/* fin de notificacion */
		}
		live.sendData("new", {kind: "newcom", data: pass.filterProtectedUID(json)});
		await dbManager.insertDB(DB, mdbScheme.C_COMS, json, () => {});
		res.json({success: true, data: json});
	});
	
	//API: login de usuario.
	//TODO: comprobacion de credenciales, sanitizado
	app.post('/api/login', function(req, res) {
		let userid = req.fields.userid.trim();
		let password = req.fields.password.trim();
		
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {$or: [{uid: userid}, {nick: new RegExp(userid, "i")}]}, "", async function(user){
			if (user[0]){
				//existe el usuario, comparar contraseña.
				//TODO: esto tendría que recibir la contraseña encriptada y bla bla bla..
				if (password !== user[0].pass){
					res.json({success: false, data: "Contraseña incorrecta."});
				} else {
					//aplicar usuario a la sesion actual.
					//TODO: añadir soporte de multiples sesiones del mismo usuario.
					await dbManager.pushDB(req.app.locals.db, mdbScheme.C_ADM, {uid: user[0].uid}, {$set: {sid: req.session.id}});
					req.session.uid = user[0].uid;
					req.session.config = user[0].extra.config;
					sesionManager.disposeUserCache(req.session.id);
					console.log("[Sesion] Usuario logeado.");
					res.json({success: true, data: "logueado."});
				}
			} else {
				//crear usuario
				//primero, comprobar que el userid sea un id valido de 32 caracteres.
				if (userid.trim().length !== 32){
					res.json({success: false, data: "ID invalido, tiene que tener 32 caracteres."});
				} else {
					let json = sesionManager.genUser(userid, password, req.session.id);
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
	app.get('/api/boxs', pass.check, function(req, res) {
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
	app.get('/api/boxs/:cat', pass.check, function(req, res) {
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
	app.get('/api/box/:bid', pass.check, function(req, res) {
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
	app.get('/api/box/:index/:kind', pass.check, function(req, res){
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
				let hasta = 20; //numero de boxs a cargar.
				dbManager.queryDBSkip(db, mdbScheme.C_BOXS, criterio, orden, desde, hasta, function(limitBoxs){
					if (limitBoxs[0]){
						//filtrar boxs hideados
						limitBoxs = cfilter.filterBoxHides(limitBoxs, req.session.config);
						res.json({success: true, data: pass.filterProtectedUID(limitBoxs)});
					} else {
						res.json({success: false, data: null});
					}
				});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//API: controla y redirige las notificaciones
	app.get('/api/ntf/:bid/:cid', async function(req, res) {
		let bid = req.params.bid;
		let cid = req.params.cid;
		let uid = req.session.uid;
		//limpiar notificaciones
		await dbManager.deleteDB(req.app.locals.db, mdbScheme.C_NOTIF, {"receiver.uid": uid, "content.bid": bid, "content.tag": false}, ()=>{});
		await dbManager.deleteDB(req.app.locals.db, mdbScheme.C_NOTIF, {"receiver.uid": uid, "content.bid": bid, "content.cid": cid, "content.tag": true}, ()=>{});
		res.redirect("/tema/" + bid + "#" + cid);
	});
	
	//API: obtener una notificacion especificada por el timestamp, usada por el popup.
	app.get('/api/notifs/:date', function(req, res) {
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
	app.get('/api/coms', pass.check, function(req, res) {
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_COMS, "", {"date.created": -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: pass.filterProtectedUID(coms)});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//API: obtener todos los comentarios en base al bid
	app.get('/api/coms/:bid', pass.check, function(req, res) {
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
	app.get('/api/categorycoms/:cat/:limit', pass.check, async function(req, res) {
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
	app.get('/api/com/:cid', pass.check, function(req, res) {
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
	app.post('/api/poll', pass.check, sesionManager.checkSesion, async function(req, res) {
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
	app.post('/api/config', pass.check, sesionManager.checkSesion, function(req, res) {
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
				//detectar y convertir booleanos
				if (options[1] === "true"){options[1] = true;}
				if (options[1] === "false"){options[1] = false;}
				
				//se asume que es una reasignacion común
				if (!req.session.config){req.session.config = {};}
				if (!sesiondata.extra.config){sesiondata.extra.config = {};}
				req.session.config[options[0]] = options[1];
				sesiondata.extra.config[options[0]] = options[1];
			}
			//guardar info en el usuario.
			dbManager.pushDB(req.app.locals.db, mdbScheme.C_ADM, {sid: req.session.id}, {$set: {"extra.config": sesiondata.extra.config}}, function(resp){});
		}
		res.send({success: true, data: req.session.config});
	});
		
		
	//DEBUG: PRUEBAS DE PORTABILIDAD ENTRE MDB Y MDBV2
	//SOLO PARA DEBUG Y TEST, ESTO LO VOY A SACAR
	app.get('/dev/del/:bid', function(req, res){
		let bid = req.params.bid;
		
		dbManager.deleteDB(req.app.locals.db, mdbScheme.C_BOXS, {bid: bid}, function(){
			dbManager.deleteDB(req.app.locals.db, mdbScheme.C_COMS, {bid: bid}, function(){
				res.redirect("/");
			});
		});
		
	});
	
	app.get('/dev/:bid', async function(req, res) {
		let bid = req.params.bid;
	
		req.app.locals.db.db("mikanchan").collection("boxs").find({bid: bid}).toArray(function(err, result){
			var tboxs = compat.checkCompat("BOX", result);
			dbManager.insertAllDB(req.app.locals.db, mdbScheme.C_BOXS, tboxs, function(res){});
			
			req.app.locals.db.db("mikanchan").collection("comentarios").find({bid: bid}).toArray(function(err, result2){
				var tcoms = compat.checkCompat("COM", result2);
				dbManager.insertAllDB(req.app.locals.db, mdbScheme.C_COMS, tcoms, function(res){});
			});
			
			res.redirect("/");
		});
		
	});
	
}