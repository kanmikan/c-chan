function check(req, res, next){
	console.log("-middleware de control-");
	next();
}


module.exports = {check}