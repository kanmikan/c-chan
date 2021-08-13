const session = require('express-session');
const MongoStore = require('connect-mongo');
const sConfig = require('../config/serverConfig');

function create(app){
	var expires = new Date(Number(new Date()) + 315360000000); //si, caduca dentro de 10 años... kjj
	app.use(session({
		secret: sConfig.SESSION_SECRET,
		store: MongoStore.create({mongoUrl: sConfig.DBURL}),
		cookie: {maxAge: expires}
	}));
}

module.exports = {create};