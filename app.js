const express = require("express");
const http = require("http");
const path = require("path");
const dbManager = require('./server/db/dbManager');
const sConfig = require('./server/serverConfig');
const routes = require('./server/routes');

/* SETUP INICIAL */
var app = express();
var server = http.createServer(app);

/* MIDDLEWARES */
//carpeta donde van los archivos estaticos.
app.use('/', express.static(path.join(__dirname, './client/static')));

/* VIEW ENGINE (EJS) */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './client/views'));

/* BASE DE DATOS */
dbManager.connect(sConfig.DBURL, {useNewUrlParser: true, useUnifiedTopology: true, ssl:sConfig.SSL}, function (db){
	
	/* RUTAS */
	routes(app, db);
	
});

//poner server en escucha en el puerto especificado.
server.listen(sConfig.PORT);
console.log("[Server] Puerto: " + sConfig.PORT + " en escucha.");
