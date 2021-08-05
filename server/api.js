const sConfig = require('./serverConfig');
const dbManager = require('./db/dbManager');

module.exports = function(app, DB){
	
	//MUESTRA: obtener todos los boxs, ordenados por ultimo bump y stickys
	//TODO: añadir filtro de datos
	app.get('/api/boxs', function(req, res) {
		dbManager.queryDB(DB, "boxs", "", {sticky: -1, bump: -1}, function(boxs){
			if (boxs[0] != undefined){
				res.json({success: true, data: boxs});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener box especificado con el bid.
	app.get('/api/box/:bid', function(req, res) {
		let bid = req.params.bid;
		dbManager.queryDB(DB, "boxs", {bid: bid}, {sticky: -1, bump: -1}, function(boxs){
			if (boxs[0] != undefined){
				res.json({success: true, data: boxs});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener todos los comentarios
	//TODO: añadir filtro de datos
	app.get('/api/coms', function(req, res) {
		dbManager.queryDB(DB, "comentarios", "", {tiempo: -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: coms});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener todos los comentarios en base al bid
	//TODO: añadir filtro de datos
	app.get('/api/coms/:bid', function(req, res) {
		let bid = req.params.bid;
		dbManager.queryDB(DB, "comentarios", {bid: bid}, {tiempo: -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: coms});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
	//MUESTRA: obtener comentario especificado con el cid
	app.get('/api/com/:cid', function(req, res) {
		let cid = req.params.cid;
		dbManager.queryDB(DB, "comentarios", {cid: cid}, {tiempo: -1}, function(coms){
			if (coms[0] != undefined){
				res.json({success: true, data: coms});
			} else {
				res.json({success: false, data: null});
			}
		});
	});
	
}