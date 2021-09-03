const session = require('express-session');
const MongoStore = require('connect-mongo');
const sConfig = require('../config/serverconfig.js');
const dbManager = require('../db/dbmanager.js');
const mdbScheme = require('../db/models/mdbscheme.js');
const jsonScheme = require('../db/models/jsonscheme.js');
const utils = require('../utils.js');

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
	
	dbManager.queryDB(req.app.locals.db, mdbScheme.C_ADM, {uid: uid}, "", function(user){
		if (user[0]){
			next();
		} else {
			//si no existe el usuario con el uid, crear usuario.
			let json = utils.clone(jsonScheme.USER_SCHEME);
			json.uid = uid;
			json.extra = {};
			//insertar el usuario a la base de datos.
			dbManager.insertDB(req.app.locals.db, mdbScheme.C_ADM, json, function(response){});
			console.log("[Sesion] Nuevo usuario anonimo generado.");
			next();
		}
	});
	
}

module.exports = {create};