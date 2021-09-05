const dbManager = require('./db/dbmanager.js');
const models = require('./db/models/dbmodels.js');
const api = require('./api.js');
const utils = require('./utils.js');
const renderConfig = require('./config/renderconfig.js');
const mdbScheme = require('./db/models/mdbscheme.js');
const compat = require('./db/compat.js');

module.exports = function(app){
	
	/* RUTA PRINCIPAL */
	app.get('/', function(req, res) {
		var uid = req.session.id; //esto puede ser cambiado por un uid unico en vez de el id de la sesion.
		dbManager.mQuery(req.app.locals.db, models.HOME_QUERY(uid), function(result){
			res.render("index", {
				it : {
					utils: utils,
					renderConfig: renderConfig,
					sesion: req.session,
					data: result
				}
			});
		});
	});
	
	/* RUTA DE LOS BOXS */
	app.get('/tema/:bid', function(req, res) {
		var uid = req.session.id;
		var bid = req.params.bid;
		
		if (bid){
			dbManager.mQuery(req.app.locals.db, models.BOX_QUERY(uid, bid), function(result){
				//si existe el box, el C_BOXS tendrá datos, de lo contrario se asume que el tema no existe.
				if (!result[mdbScheme.C_BOXS][0]){
					res.redirect("/error/1");
				} else {
					res.render("box", {
						it : {
							token: utils.randomString(16),
							utils: utils,
							renderConfig: renderConfig,
							sesion: req.session,
							data: result
						}
					});
				}
			});
		} else {
			res.redirect("/error/1");
		}
	});
	
	/* RUTAS DEL API */
	api(app);
	
	/* CATEGORIAS */
	app.get('/:cat', function(req, res) {
		var cat = req.params.cat;
		var uid = req.session.id;
		//el server hace un pequeño request de la lista de categorias, si existe accede a ella.
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_CATS, {tid: cat}, "", function(result){
			if (!result[0]){
				res.redirect("/error/2");
			} else {
				//si existe la categoria, cargar los boxs que pertenezcan a ella.
				//TODO
				dbManager.mQuery(req.app.locals.db, models.CAT_QUERY(uid, cat), function(result){
					res.render("index", {
						it : {
							utils: utils,
							renderConfig: renderConfig,
							sesion: req.session,
							data: result
						}
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
		res.status(404);
		res.send("PAGINA NO ENCONTRADA");
	});
	
}