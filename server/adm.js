/* RUTAS DE ADMINISTRACION */
const sConfig = require('./config/serverconfig.js');
const dbManager = require('./db/dbmanager.js');
const mdbScheme = require('./db/models/mdbscheme.js');
const jsonScheme = require('./db/models/jsonscheme.js');
const cache = require('./db/cache.js');
const sesionManager = require('./sesion/sesionmanager.js');
const cfilter = require('./sesion/contentfilter.js');
const utils = require('./utils.js');
const pass = require('./api/passport.js');
const moderation = require('./api/moderation.js');
const compat = require('./db/compat.js');

module.exports = function(app){
	
	app.post('/adm/command', pass.onlyADM, function(req, res) {
		let args = req.fields.args.split(" ");
		let cxArgs = req.fields.args.match(/[^\s"]+|"([^"]*)"/gi);
		let rbody = "";
		//mini interprete
		switch(args[0]){
			case "/help":
				rbody = `
					<span style="color: orange">/promote</span> uid permiso<br/>
					<span style="color: orange">/demote</span> uid permiso<br/>
					<span style="color: orange">/ban</span> uid "razon" duracion<br/>
					<span style="color: orange">/unban</span> uid<br/>
					<span style="color: orange">/msg</span> uid "texto del mensaje"<br/>
					<span style="color: orange">/user</span> uid opcion valor<br/>
					<span style="color: orange">/reload</span><br/>
					<span style="color: orange">/permisos</span> uid<br/>
					<span style="color: orange">/tracebox</span> bid<br/>
					<span style="color: orange">/tracecom</span> cid<br/>
					<span style="color: orange">/updateBox</span> bid mongodb_object<br/>
					<span style="color: orange">/updateCom</span> cid mongodb_object
					
				`;
				res.send({success: true, data: rbody});
				break;
			case "/promote":
				dbManager.pushDB(req.app.locals.db, mdbScheme.C_ADM, {uid: args[1]}, {$push: {permisos: args[2]}}, () => {});
				rbody = `permiso ${args[2]} concedido al usuario ${args[1]}`;
				res.send({success: true, data: rbody});
				break;
			case "/demote":
				dbManager.pushDB(req.app.locals.db, mdbScheme.C_ADM, {uid: args[1]}, {$pull: {permisos: args[2]}}, () => {});
				rbody = `permiso ${args[2]} quitado al usuario ${args[1]}`;
				res.send({success: true, data: rbody});
				break;
			case "/user":
				let object = {};
				object[args[2]] = args[3];
				dbManager.pushDB(req.app.locals.db, mdbScheme.C_ADM, {uid: args[1]}, {$set: object}, () => {});
				rbody = `parametro ${args[2]}:${args[3]} cambiado al usuario ${args[1]}`;
				res.send({success: true, data: rbody});
				break;
			case "/reload":
				cache.updateAll();
				sesionManager.disposeAll();
				rbody = `<span style="color:orange">cache refrescada.</span>`;
				res.send({success: true, data: rbody});
				break;
			case "/ban":
				let razon = cxArgs[2].substr(1, cxArgs[2].length-2);
				let tiempo = cxArgs[3];
				moderation.banUser(req.app.locals.db, cxArgs[1], razon, tiempo, function(resp){
					rbody = `<span style="color:red">${cxArgs[1]} baneado, razon: ${razon}, tiempo: ${tiempo}</span>`;
					res.send({success: true, data: rbody});
				});
				break;
			case "/unban":
				moderation.unbanUser(req.app.locals.db, cxArgs[1], function(resp){
					rbody = `<span style="color:orange">${cxArgs[1]} desbaneado.</span>`;
					res.send({success: true, data: rbody});
				});
				break;
			case "/permisos":
				moderation.getUserData(req.app.locals.db, cxArgs[1], function(resp){
					rbody = `<span style="color:orange">Permisos: ${resp.data[0].permisos}</span>`;
					res.send({success: true, data: rbody});
				});
				break;
			case "/tracecom":
				moderation.getUIDbyCID(req.app.locals.db, args[1], function(resp){
					rbody = `<span style="color:orange">UID: ${resp.data}</span>`;
					res.send({success: true, data: rbody});
				});
				break;
			case "/tracebox":
				moderation.getUIDbyBID(req.app.locals.db, args[1], function(resp){
					rbody = `<span style="color:orange">UID: ${resp.data}</span>`;
					res.send({success: true, data: rbody});
				});
				break;
			case "/updatebox":
				let params = JSON.parse(cxArgs[2].substr(1, cxArgs[2].length-2).replace(/'/g, '"'));
				moderation.updateBoxParams(req.app.locals.db, cxArgs[1], params, function(response){
					rbody = `<span style="color:orange">Parámetro cambiado, /reload para ver cambios</span>`;
					res.json({success: true, data: rbody});
				});
				break;
			case "/updatecom":
				let params = JSON.parse(cxArgs[2].substr(1, cxArgs[2].length-2).replace(/'/g, '"'));
				moderation.updateComParams(req.app.locals.db, cxArgs[1], params, function(response){
					rbody = `<span style="color:orange">Parámetro cambiado, /reload para ver cambios</span>`;
					res.json({success: true, data: rbody});
				});
				break;
			case "/msg":
				let text = cxArgs[2].substr(1, cxArgs[2].length-2);
				
				moderation.sendMSG(req.app.locals.db, cxArgs[1], "Admin", "/assets/logo.png", text, function(resp){
					res.send(resp);
				});
				break;
			default:
				res.send({success: true, data: "orden indefinida."});
				break;
		}
	});
	
	//ADMIN API: devuelve una lista de temas sin filtrar datos.
	app.get('/adm/boxs/:num', pass.onlyADM, function(req, res) {
		let num = req.params.num;
		dbManager.queryDBSkip(req.app.locals.db, mdbScheme.C_BOXS, "", {"date.created": -1}, 0, parseInt(num), function(boxs){
			if (boxs[0] != undefined){
				res.json({success: true, data: boxs});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//ADMIN API: devuelve una lista de comentarios sin filtrar datos.
	app.get('/adm/coms/:num', pass.onlyADM, function(req, res) {
		let num = req.params.num;
		dbManager.queryDBSkip(req.app.locals.db, mdbScheme.C_COMS, "", {"date.created": -1}, 0, parseInt(num), function(boxs){
			if (boxs[0] != undefined){
				res.json({success: true, data: boxs});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//ADMIN API: acciones criticas de alta jerarquia
	app.post('/adm/server', pass.onlyADM, function(req, res) {
		let action = req.fields.action;
		let data = req.fields.data;
		
		switch(action){
			case "adm_whitelist":
				let wlState = (data === "1") ? false : true;
				dbManager.updateDBAll(req.app.locals.db, mdbScheme.C_SVR, {}, {whitelist: wlState}, () => {});
				res.json({success: true, data: {whitelist: wlState}});
				break;
			case "adm_login":
				let loginState = (data === "1") ? false : true;
				dbManager.updateDBAll(req.app.locals.db, mdbScheme.C_SVR, {}, {login: loginState}, () => {});
				res.json({success: true, data: {login: loginState}});
				break;
			case "adm_coms":
				let comsState = (data === "1") ? false : true;
				dbManager.updateDBAll(req.app.locals.db, mdbScheme.C_SVR, {}, {coms: comsState}, () => {});
				res.json({success: true, data: {coms: comsState}});
				break;
			case "adm_boxs":
				let boxsState = (data === "1") ? false : true;
				dbManager.updateDBAll(req.app.locals.db, mdbScheme.C_SVR, {}, {boxs: boxsState}, () => {});
				res.json({success: true, data: {boxs: boxsState}});
				break;
			default:
				res.json({success: false, data: "accion no definida"});
				break;
		}
		
	});
	
	//ADMIN API: realizar acciones de moderacion.
	app.post('/adm/action', pass.onlyMOD, function(req, res) {
		let action = req.fields.action;
		let data = req.fields.data;
		
		switch(action){
			case "com_adv":
				//TODO: sistema de advertencias.
				//moderation.advUserByCID(req.app.locals.db, data);
				res.json({success: false, data: {action: action, response: "-no implementado-"}});
				break;
			case "com_delete":
				moderation.deleteComment(req.app.locals.db, data, function(response){
					res.json({success: response.success, data: {action: action, response: response.data}});
				});
				break;
			case "com_ban":
				let parsed = data.split(":");
				moderation.banUserByCID(req.app.locals.db, parsed[0], parsed[1], parsed[2], function(response){
					res.json({success: response.success, data: {action: action, response: response.data}});
				});
				break;
			case "box_ban":
				let bparsed = data.split(":");
				moderation.banUserByBID(req.app.locals.db, bparsed[0], bparsed[1], bparsed[2], function(response){
					res.json({success: response.success, data: {action: action, response: response.data}});
				});
				break;
			case "box_delete":
				moderation.deleteBox(req.app.locals.db, data, function(response){
					res.json({success: response.success, data: {action: action, response: response.data}});
				});
				break;
			case "box_move":
				data = data.split(":");
				moderation.moveBox(req.app.locals.db, data[0], data[1], function(response){
					res.json({success: response.success, data: {action: action, response: response.data}});
				});
				break;
			case "box_change":
				data = data.split(":");
				let sticky = ((data[1] === "true") ? 1 : 0);
				let csticky = ((data[2] === "true") ? 1 : 0);
				
				moderation.updateBoxParams(req.app.locals.db, data[0], {"date.sticky": sticky, "date.csticky": csticky}, function(response){
					res.json({success: response.success, data: {action: action, response: response.data}});
				});
				break;
			default:
				res.json({success: false, data: "accion no definida"});
				break;
		}
		
	});
	
	//DEBUG: PRUEBAS DE PORTABILIDAD ENTRE MDB Y MDBV2
	//SOLO PARA DEBUG Y TEST, ESTO LO VOY A SACAR
	app.get('/dev/del/:bid' , pass.onlyADM, function(req, res){
		let bid = req.params.bid;
		
		dbManager.deleteDB(req.app.locals.db, mdbScheme.C_BOXS, {bid: bid}, function(){
			dbManager.deleteDB(req.app.locals.db, mdbScheme.C_COMS, {bid: bid}, function(){
				res.redirect("/");
			});
		});
		
	});
	
	app.get('/dev/ping', pass.onlyADM, function(req, res){
		res.send({result: "pong", data: req.ip});
	});
	
	app.get('/dev/randomness/:count', pass.onlyADM, function(req, res){
		let count = parseInt(req.params.count);
		
		let anone = [
			["amarillo", 90], //amarillo
			["azul", 90], //azul
			["verde", 90], //verde
			["rojo", 90], //rojo
			["multi", 20], //multi
			["invertido", 20], //invertido
			["black", 3], //black
			["yuu.png", 1], //yuu
			["white", 3] //white
		];
		let object = {};
		
		for(let i=0; i<count; i++){
			let selected = utils.weightRandom(anone);
			if (!object[selected]){
				object[selected] = 1;
			} else {
				object[selected] = object[selected] + 1;
			}
		}
		
		res.send(object);
		
	});
	
	
	app.get('/dev/:bid', pass.onlyADM, async function(req, res) {
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