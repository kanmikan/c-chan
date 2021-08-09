const dbManager = require('./db/dbManager');
const models = require('./db/models/dbModels');
const api = require('./api');


module.exports = function(app, DB){
	
	/* RUTA PRINCIPAL */
	app.get('/', function(req, res) {
		
		var uid = "bot"; //uso el usuario "bot" de la base de datos de mikanchan como muestra.
		dbManager.mQuery(DB, models.HOME_QUERY(uid), function(result){
			res.render("index", {data: result});
		});
		
	});
	
	/* RUTAS DEL API */
	api(app, DB);
	
}