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

module.exports = function(app){
	
	app.post('/adm/command', pass.onlyADM, function(req, res) {
		let args = req.fields.args.split(" ");
		let rbody = "";
		//mini interprete
		switch(args[0]){
			case "/help":
				rbody = `
					<span style="color: orange">/promote</span> uid permiso<br/>
					<span style="color: orange">/demote</span> uid permiso<br/>
					<span style="color: orange">/ban</span> uid razon duracion<br/>
					<span style="color: orange">/user</span> uid opcion valor<br/>
					<span style="color: orange">/reload</span>
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
				let uid = args[1];
				let razon = args[2];
				let tiempo = args[3];
				//TODO: banear user
				
				rbody = `${uid} baneado.`;
				res.send({success: true, data: rbody});
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
	
	//ADMIN API: realizar acciones de moderacion.
	app.post('/adm/action', pass.onlyADM, function(req, res) {
		let action = req.fields.action;
		let data = req.fields.data;
		
		switch(action){
			case "com_adv":
				//moderation.advUserByCID(req.app.locals.db, data);
				res.json({success: false, data: action});
				break;
			case "com_delete":
				moderation.deleteComment(req.app.locals.db, data, function(response){
					res.json(response);
				});
				break;
			case "com_ban":
				moderation.banUserByCID(req.app.locals.db, data, "-razon-", 1000, function(response){
					res.json(response);
				});
				break;
			case "box_ban":
				moderation.banUserByBID(req.app.locals.db, data, "-razon-", 1000, function(response){
					res.json(response);
				});
				break;
			case "box_delete":
				moderation.deleteBox(req.app.locals.db, data, function(response){
					res.json(response);
				});
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