const session = require('express-session');
const MongoStore = require('connect-mongo');
const sConfig = require('../config/serverConfig');

function create(app){
	app.use(session({
		secret: sConfig.SESSION_SECRET,
		store: MongoStore.create({
			mongoUrl: sConfig.DBURL
		})
	}));
}

module.exports = {create};