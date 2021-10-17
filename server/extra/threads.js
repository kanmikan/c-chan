/* SE ENCARGA DE LOS THREADS ASINRONICOS QUE SE EJECUTAN INDEPENDIENTEMENTE*/
const cron = require('node-cron');
const sConfig = require('../config/serverconfig.js');
const malbot = require('./malbot.js');

function init(db){
	if (sConfig.CRON_THREADS){
		console.log("[threads] Cron se ejecutará cada 5 minutos");
		//ejecutar hilo cada 5 minutos.
		cron.schedule('*/5 * * * *', () => {
			//hilo del malbot
			malbot.check(db, 0, function(response){
				console.log(response.data);
			});
		});
	}	
}

module.exports = {init}