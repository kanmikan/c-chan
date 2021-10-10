/* RUTAS DE ADMINISTRACION */
const sConfig = require('./config/serverconfig.js');
const dbManager = require('./db/dbmanager.js');
const mdbScheme = require('./db/models/mdbscheme.js');
const jsonScheme = require('./db/models/jsonscheme.js');
const sesionManager = require('./sesion/sesionmanager.js');
const cfilter = require('./sesion/contentfilter.js');
const utils = require('./utils.js');
const pass = require('./api/passport.js');

module.exports = function(app){
	
	app.post('/adm/command', pass.onlyADM, function(req, res) {
		let args = req.fields.args.split(" ");
		let rbody = "";
		//mini interprete
		switch(args[0]){
			case "/help":
				rbody = "/promote uid permiso<br/>/demote uid permiso<br/>/ban uid razon duracion";
				res.send({success: true, data: rbody});
				break;
			case "/promote":
				//TODO: añadir permiso al user.
				
				rbody = `permiso ${args[2]} concedido al usuario ${args[1]}`;
				res.send({success: true, data: rbody});
				break;
			case "/demote":
				//TODO: quitar permiso al user.
				
				rbody = `permiso ${args[2]} quitado al usuario ${args[1]}`;
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
	
	app.get('/adm/boxs/:num', pass.onlyADM, function(req, res) {
		let num = req.params.num;
		dbManager.queryDBSkip(req.app.locals.db, mdbScheme.C_BOXS, "", {"date.bump": -1}, 0, parseInt(num), function(boxs){
			if (boxs[0] != undefined){
				res.json({success: true, data: boxs});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
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
	
}