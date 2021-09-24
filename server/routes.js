const dbManager = require('./db/dbmanager.js');
const models = require('./db/models/dbmodels.js');
const api = require('./api.js');
const utils = require('./utils.js');
const renderConfig = require('./config/renderconfig.js');
const mdbScheme = require('./db/models/mdbscheme.js');
const compat = require('./db/compat.js');
const cfilter = require('./sesion/contentfilter.js');

module.exports = function(app){
	
	/* RUTA PRINCIPAL */
	app.get('/', function(req, res) {
		var uid = req.session.uid;
		dbManager.mQuery(req.app.locals.db, models.HOME_QUERY(uid), function(result){
			result[mdbScheme.C_BOXS] = cfilter.filterBoxHides(result[mdbScheme.C_BOXS], req.session.config);
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
	
	/* RUTA DE LOGEO */
	app.get('/login', function(req, res) {
		var uid = req.session.uid;
		dbManager.mQuery(req.app.locals.db, models.HOME_QUERY(uid), function(result){
			res.render("login", {
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
		var uid = req.session.uid;
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
	
	//RUTA: lista de favoritos.
	//llamada para añadir elemento: applyConfig("favs_add:bid"), donde bid es el id del box a añadir a favoritos.
	app.get('/favoritos', function(req, res) {
		//leer favoritos del usuario
		let favoritos = req.session.config.favs;
		
		//preparar filtro para mongodb
		//TODO: filtrar elementos para evitar ataques a la base de datos.
		let filterArrayElements = [];
		favoritos.forEach(function(fav){
			filterArrayElements.push({bid: fav});
		});
		let filter = {$or: filterArrayElements};
		
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, filter, {"date.created": -1, "date.bump": -1}, function(rboxs){
			dbManager.mQuery(req.app.locals.db, models.HOME_QUERY(req.session.uid), function(result){
				result[mdbScheme.C_BOXS] = rboxs;
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
	});
	
	//RUTA: lista de temas ocultos.
	//llamada para añadir elemento: applyConfig("boxhides_add:bid"), donde bid es el id del box a ocultar.
	//TODO: hacer generico el codigo repetido.
	app.get('/ocultos', function(req, res) {
		let ocultos = req.session.config.boxhides;
		
		let filterArrayElements = [];
		ocultos.forEach(function(oculto){
			filterArrayElements.push({bid: oculto});
		});
		let filter = {$or: filterArrayElements};
		
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, filter, {"date.created": -1, "date.bump": -1}, function(rboxs){
			dbManager.mQuery(req.app.locals.db, models.HOME_QUERY(req.session.uid), function(result){
				result[mdbScheme.C_BOXS] = rboxs;
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
	});
	
	//RUTA: buscar palabras clave en temas y devolver resultado
	app.get('/search/:query', function(req, res) {
		let query = req.params.query;
		
		let regexQuery = {$regex: '.*' + query + '.*', $options: 'i'};
		let search = {$or: [
				{"content.title": regexQuery},
				{"content.body": regexQuery},
				{"content.extra.title2": regexQuery}
		]};
		
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_BOXS, search, {"date.created": -1, "date.bump": -1}, function(rboxs){
			dbManager.mQuery(req.app.locals.db, models.HOME_QUERY(req.session.uid), function(result){
				result[mdbScheme.C_BOXS] = rboxs;
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
	});
	
	/* RUTAS DEL API */
	api(app);
	
	/* CATEGORIAS */
	app.get('/:cat', function(req, res) {
		var cat = req.params.cat;
		var uid = req.session.uid;
		//el server hace un pequeño request de la lista de categorias, si existe accede a ella.
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_CATS, {"catid": cat}, "", function(result){
			if (!result[0]){
				res.redirect("/error/2");
			} else {
				//si existe la categoria, cargar los boxs que pertenezcan a ella.
				//TODO
				dbManager.mQuery(req.app.locals.db, models.CAT_QUERY(uid, cat), function(result){
					result[mdbScheme.C_BOXS] = cfilter.filterBoxHides(result[mdbScheme.C_BOXS], req.session.config);
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