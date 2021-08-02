const express = require("express");
const http = require("http");
const path = require("path");

/* SETUP INICIAL */
var PORT = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);

/* MIDDLEWARES */
//carpeta donde van los archivos estaticos.
app.use('/', express.static(path.join(__dirname, 'client/static')));

/* VIEW ENGINE (EJS) */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './client/views'));

/* RUTAS */
var rutas = require('./server/rutas')(app);

//poner server en escucha en el puerto especificado.
server.listen(PORT);
console.log("[Server] Puerto: " + PORT + " en escucha.");
