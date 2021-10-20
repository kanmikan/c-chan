/* WEBSOCKETS EXPERIMENTAL */
const WebSocketServer = require("ws").WebSocketServer;
const WebSocket = require("ws").WebSocket;
const {v4: uuidv4} = require("uuid");

let ws;

function init(server, sesion){
	const wss = new WebSocketServer({port: 3003});
	wss.genSID = function(){
		return uuidv4();
	}
	
	ws = new WebSocket('ws://localhost:3003');
	wsLiveSession(wss);
	console.log("[WebSocket] WebSockets Iniciado");
	return wss;
}

function sendData(key, data){
	ws.send(JSON.stringify(data));
}

function sendDataTo(channel, key, data){
	ws.send(JSON.stringify(data));
}

function wsLiveSession(wss){
	wss.on('connection', function(ws) {
		ws.id = wss.genSID();
		
		/*
		//codigo en el cliente:
		let wsocket = new WebSocket("ws://localhost:8080");
		wsocket.onopen = function(e){
			wsocket.send(JSON.stringify({channel: "test", data: "testo"}));
		}
		*/
		wchannel.on(ws, "test", function(data){
			console.log(data);
		})
		
	});
	
	return wss;
}

var wchannel = {
	on: function(ws, channel, callback){
		ws.on('message', function(data) {
			let resp;
			try {
				resp = JSON.parse(data.toString());
			} catch (e) {
				resp = data.toString();
			}
			if (resp.channel && resp.channel === channel){
				callback(resp.data);
			}
		});
	}
	join: function(wsid, channel){
		//todo: un hashmap o algo para asociar al wsid con el canal.
	}
}

module.exports = {init, sendData, sendDataTo}