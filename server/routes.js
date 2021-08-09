const dbManager = require('./db/dbManager');
const models = require('./db/models/dbModels');
const api = require('./api');
const renderConfig = require('./config/renderConfig');

module.exports = function(app, DB){
	
	/* RUTA PRINCIPAL */
	app.get('/', function(req, res) {
		var uid = req.session.id; //esto puede ser cambiado por un uid unico en vez de el id de la sesion.
		dbManager.mQuery(DB, models.HOME_QUERY(uid), function(result){
			res.render("index", {
				data: result, 
				renderConfig: renderConfig,
				sesion: req.session //envio la sesion al render
			});
		});
		
	});
	
	/* RUTAS DEL API */
	api(app, DB);
	
}