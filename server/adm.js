/* RUTAS DE ADMINISTRACION */
const sConfig = require('./config/serverconfig.js');
const dbManager = require('./db/dbmanager.js');
const mdbScheme = require('./db/models/mdbscheme.js');
const jsonScheme = require('./db/models/jsonscheme.js');
const sesionManager = require('./sesion/sesionmanager.js');
const cfilter = require('./sesion/contentfilter.js');
const utils = require('./utils.js');

module.exports = function(app){
	
	app.get('/adm/boxs/:num', function(req, res) {
		let num = req.params.num;
		dbManager.queryDBSkip(req.app.locals.db, mdbScheme.C_BOXS, "", {"date.bump": -1}, 0, parseInt(num), function(boxs){
			if (boxs[0] != undefined){
				res.json({success: true, data: boxs});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
}