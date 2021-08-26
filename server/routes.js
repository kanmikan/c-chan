const dbManager = require('./db/dbManager');
const models = require('./db/models/dbModels');
const api = require('./api');
const utils = require('./utils');
const renderConfig = require('./config/renderConfig');
const mdbScheme = require('./db/models/mdbScheme');
const compat = require('./compat');

module.exports = function(app, DB){
	
	/* RUTA PRINCIPAL */
	app.get('/', function(req, res) {
		var uid = req.session.id; //esto puede ser cambiado por un uid unico en vez de el id de la sesion.
		
		dbManager.mQuery(DB, models.HOME_QUERY(uid), function(result){
			//compat test entre mdb y mdbv2
			result.boxs = compat.checkCompat("BOX", result.boxs);
			
			res.render("index", {
				utils: utils,
				renderConfig: renderConfig,
				sesion: req.session,
				data: result
			});
		});

	});
	
	/* RUTA DE LOS BOXS */
	app.get('/tema/:bid', function(req, res) {
		var uid = req.session.id;
		var bid = req.params.bid;
		
		dbManager.mQuery(DB, models.BOX_QUERY(uid, bid), function(result){
			//si existe el box, el C_BOXS tendrá datos, de lo contrario se asume que el tema no existe.
			if (!result[mdbScheme.C_BOXS][0]){
				res.redirect("/error/1");
			} else {
				res.render("box", {
					utils: utils,
					renderConfig: renderConfig,
					sesion: req.session,
					data: result
				});
			}
		});
		
	});
	
	/* RUTAS DEL API */
	api(app, DB);
	
	/* CATEGORIAS */
	app.get('/:cat', function(req, res) {
		var cat = req.params.cat;
		var uid = req.session.id;
		
		//el server hace un pequeño request de la lista de categorias, si existe accede a ella.
		dbManager.queryDB(DB, mdbScheme.C_CATS, {tid: cat}, "", function(result){
			if (!result[0]){
				res.redirect("/error/2");
			} else {
				//si existe la categoria, cargar los boxs que pertenezcan a ella.
				//TODO
				dbManager.mQuery(DB, models.CAT_QUERY(uid, cat), function(result){
					res.render("index", {
						utils: utils,
						renderConfig: renderConfig,
						sesion: req.session,
						data: result
					});
				});
				
			}
		});
	});
	
	/* RUTAS DE ERROR */
	app.get('/error/:id', function(req, res) {
		var id = req.params.id;
		//placeholder del control de errores.
		res.send("ERROR: " + id);
	});
	
	app.get('*', function(req, res) {
		//placeholder del control de errores.
		res.send("PAGINA NO ENCONTRADA");
	});
	
}