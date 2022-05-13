const express = require("express");
const http = require("http");
const path = require("path");
const compression = require("compression");
const minify = require("express-minify");
const formidable = require("express-formidable");
const dbManager = require("./server/db/dbmanager.js");
const sConfig = require("./server/config/serverconfig.js");
const routes = require("./server/routes");
const sesionManager = require("./server/sesion/sesionmanager.js");
const live = require("./server/api/live.js");
const cache = require("./server/db/cache.js");
const defaults = require("./server/db/defaults.js");
const threads = require("./server/extra/threads.js");

/* SETUP INICIAL */
var app = express();
var server = http.createServer(app);

/* MIDDLEWARES */

//compresion y minificar
app.use(compression());

//carpeta del node.
//TODO: sacar esto de aca.
app.use('/node', express.static(path.join(__dirname, 'node_modules/')));

//ignorar la carpeta del node.
app.use(minify());

//carpeta donde van los archivos estaticos.
app.use('/', express.static(path.join(__dirname, './client/static'), sConfig.STATIC_CACHE_VALUE));
//carpeta de subidas locales..
app.use('/uploads', express.static(path.join(__dirname, './uploads'), sConfig.STATIC_CACHE_VALUE));

//formidable para los post request
app.use(formidable({}, [{event: 'error', action: function (req, res, next, name){console.log("[formidable] Error en el post request.");}}]));

/* VIEW ENGINE (EJS) */
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, './client/views'));

/* BASE DE DATOS */
dbManager.connect(sConfig.DBURL, {useNewUrlParser: true, useUnifiedTopology: true, ssl:sConfig.SSL}, async function (db){ 
	app.locals.db = db;
		
	/* SESION */
	let sesion = sesionManager.create(app);
	
	/* CACHE MANAGER */
	await cache.init(db);
	
	/* CARGAR DEFAULTS */
	await defaults.init(db);
	
	/* WEBSOCKETS (socket.io) */
	live.init(server, sesion);
	
	/* RUTAS */
	routes(app);
	
	/* THREADS ASINCRONICOS */
	threads.init(db);
	
});

//poner server en escucha en el puerto especificado.
server.listen(sConfig.PORT);
console.log("[Server] Puerto: " + sConfig.PORT + " en escucha.");
