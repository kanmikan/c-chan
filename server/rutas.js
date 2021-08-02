const dbManager = require('./db/dbManager');

module.exports = function(app, DB){
	
	//ruta raiz
	app.get('/', function(req, res) {
		
		//muestra
		dbManager.queryDB(DB, "boxs", "", {bump: -1}, function(response){
			res.send(response);
		});
		
	});
	
}