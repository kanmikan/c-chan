const {v4: uuidv4} = require("uuid");

/* FUNCIONES UTILITARIAS DE USO EN EL SERVER Y EN EL RENDER */
function clone(json){
	return JSON.parse(JSON.stringify(json));
}

function getCategoryData(categorias, tid){
	if (categorias[0] === undefined){return {icon: "/assets/logo.png"}}
	return categorias.filter( item => item.tid === tid)[0];
}

function filterComMedia(comments){
	return comments.filter( item => item.img.full != "");
}

function getCatShow(categoria){
	//añadir parametros especiales a las categorias, ejemplo: oficial
	if (categoria === "oficial"){return "<span>Oficial</span>";}
	return categoria.toUpperCase();
}

function timeSince(timestamp) {
	var now = new Date(); 
	var secondsPast = (now.getTime() - timestamp) / 1000;
	
	if (secondsPast < 60) {
		return parseInt(secondsPast) + 's';
	} else if (secondsPast < 3600) {
		return parseInt(secondsPast / 60) + 'm';
	} else if (secondsPast < 86400) {
		return parseInt(secondsPast / 3600) + 'h';
	} else if (secondsPast < 2678400) {
		return parseInt(secondsPast / 86400) + 'd';
	} else if (secondsPast <= 32140800) {
		return parseInt(secondsPast / 2678400) + 'ms';
	} else if (secondsPast > 32140800) {
		return parseInt(secondsPast / 32140800) + 'a';
	}	
}

function formatBytes(a,b=2){
	if (0===a) return "0 Bytes";
	const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));
	return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d];
}

function genCID(len){
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var result = "";
	for (var i = len; i > 0; --i){
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

function randomString(len){
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	var result = "";
	for (var i = len; i > 0; --i){
		result += chars[Math.floor(Math.random() * chars.length)];
	}
	return result;
}

function isGif(url){
	return url.slice(-4) === ".gif";
}

function getPollPercent(poll1, poll2){
	var total = poll1+poll2;
	if (total === 0) return ["",""];
	//sacar porcentaje de diferencia segun cantidad de votos
	var per = (poll1/total) * 100;
	var per2 = (poll2/total) * 100;
	return [Math.round(per) + "%", Math.round(per2) + "%"];
} 

function parseCookies(raw){
	let cookie = raw.split(";");
	let obj = {};
	for (var i=0; i<cookie.length; i++){
		let data = cookie[i].split("=");
		obj[data[0].trim()] = data[1];
	}
	return obj;
}

module.exports = {isGif, clone, getCategoryData, filterComMedia, getCatShow, timeSince, formatBytes, getPollPercent, genCID, uuidv4, randomString, parseCookies};