/* SE ENCARGA DE LOS THREADS ASINRONICOS QUE SE EJECUTAN INDEPENDIENTEMENTE*/
const cron = require('node-cron');
const sConfig = require('../config/serverconfig.js');
const malbot = require('./malbot.js');

function init(db){
	if (sConfig.CRON_THREADS){
		console.log("[threads] Thread del cron ejecutandose.");
		cron.schedule(sConfig.CRON_HEARTBEAT, () => {
			//malbot
			malbot.check(db, 0, function(response){
				console.log(response.data);
			});
			
		});
	}	
}

module.exports = {init}