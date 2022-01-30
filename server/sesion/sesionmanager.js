const session = require('express-session');
const MongoStore = require('connect-mongo');
const sConfig = require('../config/serverconfig.js');
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const utils = require('../utils.js');
const csrf = require('simple-csrf');
const defaults = require('../db/defaults.js');
const access = require('../api/access.js');

var USER_FLAG = [];

//FUNCION: inicializa el gestor de sesiones.
function create(app){
	var expires = new Date(Number(new Date()) + 315360000000); //si, caduca dentro de 10 años... kjj
	let sesion = session({
		secret: sConfig.SESSION_SECRET,
		store: MongoStore.create({
			mongoUrl: sConfig.DBURL,
			mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true, ssl:sConfig.SSL},
			ttl: 7 * 24 * 60 * 60 //7 dias de expiracion para la sesion, si el usuario no se conecta antes.
		}),
		cookie: {maxAge: expires}
	});
	app.use(sesion);
	app.use(csrf());
	app.use(checkUser);
	return sesion;
}

function checkUser(req, res, next){
	//aca se compara el uid del usuario
	let uid = utils.randomString(32); //id unico generado para el uid.
	let sid = req.session.id;
	
	//solo comprobar UNA vez, la implementacion no me gusta nada pero MESSIRVE
	if (!(USER_FLAG.filter(item => item.sid === sid).length > 0)){
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {sid: sid}, "", function(user){
			if (user[0]){
				cacheUser({sid: sid, data: user[0]});
				req.session.uid = user[0].uid;
				req.session.config = user[0].extra.config;
				next();
			} else {
				//si no existe el usuario con el uid, crear un usuario efimero.
				let json = genUser(uid, sid);
				//añadir al uid dentro del flag para que no haga otra query al pedo.
				cacheUser({sid: sid, data: json});
				//configurar en el middleware.
				req.session.uid = uid;
				req.session.config = json.extra.config;
				console.log("[Sesion] Nuevo usuario efimero generado.");
				next();
			}
		});
	} else {
		next();
	}
}

//FUNCION: genera un usuario nuevo, y lo retorna
function genUser(uid, pass, sid){
	let json = utils.clone(jsonScheme.USER_SCHEME);
	json.uid = uid;
	json.pass = pass;
	json.sid = sid;
	json.extra = {
		config: defaults.getDefUserConfig()
	};
	return json;
}

//MIDDLEWARE: detecta si el usuario esta "logueado" y redirige al modal de bienvenida si no lo está
function checkSesion(req, res, next){
	let sid = req.session.id;
	dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {sid: sid}, "", async function(user){
		if (!user[0]){
			console.log("[Sesion] Usuario efimero detectado, redirigir al logeo.");
			res.json({success: false, data: {redirect: true, to: "/login"}});
		} else {
			access.whitelist(req.app.locals.db, user[0], function(access){
				if (access){
					res.json(access);
				} else {
					next();
				}
			});
		}
	});
}

function getUserData(sid){
	return USER_FLAG.filter(item => item.sid === sid);
}

function disposeUserCache(sid){
	USER_FLAG = USER_FLAG.filter(item => item.sid != sid);
}

function disposeAll(){
	USER_FLAG = [];
}

function cacheUser(sid){
	USER_FLAG.push(sid);
	if (USER_FLAG.length > 50){
		USER_FLAG.shift();
	}
}

module.exports = {create, getUserData, disposeUserCache, disposeAll, checkSesion, genUser};