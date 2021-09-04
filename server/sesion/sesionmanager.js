const session = require('express-session');
const MongoStore = require('connect-mongo');
const sConfig = require('../config/serverconfig.js');
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const utils = require('../utils.js');

var USER_FLAG = [];

function create(app){
	var expires = new Date(Number(new Date()) + 315360000000); //si, caduca dentro de 10 años... kjj
	let sesion = session({
		secret: sConfig.SESSION_SECRET,
		store: MongoStore.create({
			mongoUrl: sConfig.DBURL,
			mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true, ssl:sConfig.SSL}
		}),
		cookie: {maxAge: expires}
	});
	app.use(sesion);
	app.use(createUser);
	return sesion;
}

function createUser(req, res, next){
	//aca se compara el uid del usuario
	let uid = req.session.id;
	
	//solo comprobar UNA vez, la implementacion no me gusta nada pero MESSIRVE
	if (!USER_FLAG.includes(uid)){
		dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {uid: uid}, "", function(user){
			if (user[0]){
				USER_FLAG.push(uid);
				next();
			} else {
				//añadir al uid dentro del flag para que no haga otra query al pedo.
				USER_FLAG.push(uid);
				//si no existe el usuario con el uid, crear usuario.
				let json = utils.clone(jsonScheme.USER_SCHEME);
				json.uid = uid;
				json.extra = {};
				//insertar el usuario a la base de datos de manera asincronica.
				dbManager.insertDB(req.app.locals.db, mdbScheme.C_ADM, json, function(response){});
				console.log("[Sesion] Nuevo usuario anonimo generado.");
				next();
			}
		});
	} else {
		next();
	}	
}

module.exports = {create};