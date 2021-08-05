const dbManager = require('./db/dbManager');
const models = require('./db/models/dbModels');
const api = require('./api');


module.exports = function(app, DB){
	
	/* RUTA PRINCIPAL */
	app.get('/', function(req, res) {
		
		var uid = "bot"; //uso el usuario "bot" de la base de datos de mikanchan como muestra.
		dbManager.mQuery(DB, models.HOME_QUERY(uid), function(result){
			//MUESTRA: datos que utiliza el render de la home.
			res.send(result);
			
			//TODO: enviar los todos datos al render
			//res.render("index", result);
			
		});
		
	});
	
	/* RUTAS DEL API */
	api(app, DB);
	
}