const session = require('express-session');
const MongoStore = require('connect-mongo');
const sConfig = require('../config/serverconfig.js');

function create(app){
	var expires = new Date(Number(new Date()) + 315360000000); //si, caduca dentro de 10 años... kjj
	let sesion = session({
		secret: sConfig.SESSION_SECRET,
		store: MongoStore.create({mongoUrl: sConfig.DBURL}),
		cookie: {maxAge: expires}
	});
	app.use(sesion);
	return sesion;
}

module.exports = {create};