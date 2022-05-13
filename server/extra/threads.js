/* SE ENCARGA DE LOS THREADS ASINRONICOS QUE SE EJECUTAN INDEPENDIENTEMENTE*/
const cron = require('node-cron');
const sConfig = require('../config/serverconfig.js');
const malbotv2 = require('./malbotv2.js');

function init(db){
	if (sConfig.CRON_THREADS){
		console.log("[threads] Thread del cron ejecutandose.");
		cron.schedule(sConfig.CRON_HEARTBEAT, () => {
			
			//malbot
			malbotv2.check(db, 0, function(response){
				console.log(response.data);
			});
			
		});
	}	
}

module.exports = {init}