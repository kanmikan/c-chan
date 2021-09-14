/* CONTROLA LA CONEXION DE WEBSOCKET */
const socket = require('socket.io');
const sharedsession = require('express-socket.io-session');

let io;

function init(server, sesion){
	console.log("[SocketIO] WebSockets Iniciado");
	io = socket(server);
	
	//envio los datos de la sesion al socketio.
	io.use(sharedsession(sesion, {
		autoSave: true
	}));
	
	liveSession(io);
	return io;
}

function sendDataTo(channel, key, data){
	io.to(channel).emit(key, data);
}

function sendData(key, data){
	io.sockets.emit(key, data);
}

function liveSession(io){
	io.on('connection', function(socket){
		//console.log("[SocketIO] Sesion Iniciada.");
		socket.join(socket.handshake.session.uid);
		
		socket.on('disconnect', () => {
			//console.log("[SocketIO] Sesion Terminada.");
			socket.leave(socket.handshake.session.uid);
		});
		
		socket.on('room', function(data){
			socket.join(data);
		});
		socket.on('leave', function(data){
			socket.leaveAll();
			socket.join(socket.handshake.session.uid);
		});
		socket.on('test', function(data){
			console.log(data);
		});
		
	});
	return io;
}

function getIO(){
	return io;
}

module.exports = {init, getIO, sendDataTo, sendData}