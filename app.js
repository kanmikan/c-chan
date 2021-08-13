const express = require("express");
const http = require("http");
const path = require("path");
const eta = require("eta");
const dbManager = require('./server/db/dbManager');
const sConfig = require('./server/config/serverConfig');
const routes = require('./server/routes');
const sesionManager = require('./server/sesion/sesionManager');

/* SETUP INICIAL */
var app = express();
var server = http.createServer(app);

/* MIDDLEWARES */
//carpeta donde van los archivos estaticos.
app.use('/', express.static(path.join(__dirname, './client/static')));
//carpeta del node.
app.use('/node', express.static(path.join(__dirname, 'node_modules/')))

/* VIEW ENGINE (ETA) */
app.engine("eta", eta.renderFile);
app.set("view engine", "eta");
//app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './client/views'));

/* BASE DE DATOS */
dbManager.connect(sConfig.DBURL, {useNewUrlParser: true, useUnifiedTopology: true, ssl:sConfig.SSL}, function (db){
	
	/* SESION */
	sesionManager.create(app);
	
	/* RUTAS */
	routes(app, db);
	
});

//poner server en escucha en el puerto especificado.
server.listen(sConfig.PORT);
console.log("[Server] Puerto: " + sConfig.PORT + " en escucha.");
