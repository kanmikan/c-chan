const { v4: uuidv4 } = require("uuid");
const youtube = require('./api/youtube.js');


/* FUNCIONES UTILITARIAS DE USO EN EL SERVER Y EN EL RENDER */
function clone(json) {
    return JSON.parse(JSON.stringify(json));
}

function getCategoryData(categorias, catid) {
    let default_ = { content: { media: { icon: "/assets/logo.png", image: "/assets/logo.png", misc: [] } } }
    if (categorias[0] === undefined) { return default_; }
    let filteredCat = categorias.filter(item => item.catid === catid)[0];
    return (filteredCat) ? filteredCat : default_;
}

function filterComMedia(comments) {
    if (comments) {
        return comments.filter(item => item.img.full != "");
    } else {
        return comments;
    }
}

function getCatShow(categoria) {
    //añadir parametros especiales a las categorias, ejemplo: oficial
    if (categoria === "oficial") { return "<span>Oficial</span>"; }
    return categoria.toUpperCase();
}

function isTagOp(tag, boxs, coms){
	let comdata = coms.filter(item => (item.cid === tag));
	return (comdata[0] && comdata[0].user.uid) === (boxs[0] && boxs[0].user.uid);
}

//FUNCION: genera un hash de color random basado en un seed.
function genColor(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
}

function isDataImage(url) {
	let tst = url.split(":");
	return (tst[0] === "data") ? true : false;
}

//FUNCION: genera un string random basado en un seed.
//https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
        h = h << 13 | h >>> 19;
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

function timeSince(timestamp, mode=0) {
    var now = new Date();
    var secondsPast = (now.getTime() - timestamp) / 1000;

    if (secondsPast < 60) {
        return parseInt(secondsPast) + ((mode === 0) ? 's' : ' segundos');
    } else if (secondsPast < 3600) {
        return parseInt(secondsPast / 60) + ((mode === 0) ? 'm' : ' minuto' + ((parseInt(secondsPast / 60) != 1) ? "s" : ""));
    } else if (secondsPast < 86400) {
        return parseInt(secondsPast / 3600) + ((mode === 0) ? 'h' : ' hora' + ((parseInt(secondsPast / 3600) != 1) ? "s" : ""));
    } else if (secondsPast < 2678400) {
        return parseInt(secondsPast / 86400) + ((mode === 0) ? 'd' : ' dia' + ((parseInt(secondsPast / 86400) != 1) ? "s" : ""));
    } else if (secondsPast <= 32140800) {
        return parseInt(secondsPast / 2678400) + ((mode === 0) ? 'ms' : ' mes' + ((parseInt(secondsPast / 2678400) != 1) ? "es" : ""));
    } else if (secondsPast > 32140800) {
        return parseInt(secondsPast / 32140800) + ((mode === 0) ? 'a' : ' año' + ((parseInt(secondsPast / 32140800) != 1) ? "s" : ""));
    }
}

function formatBytes(a, b = 2) {
    if (0 === a) return "0 Bytes";
    const c = 0 > b ? 0 : b,
        d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d];
}

function genCID(len) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = len; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function randomString(len) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var result = "";
    for (var i = len; i > 0; --i) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

function isGif(url) {
    return url.slice(-4) === ".gif";
}

function isImg(url) {
    let match = url.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)/i)
    return (match) ? true : false;
}

function isVideo(url) {
    let match = url.match(/\.(webm|mp4)$/i)
    return (match) ? true : false;
}

function getPollPercent(poll1, poll2) {
    var total = poll1 + poll2;
    if (total === 0) return ["", ""];
    //sacar porcentaje de diferencia segun cantidad de votos
    var per = (poll1 / total) * 100;
    var per2 = (poll2 / total) * 100;
    return [Math.round(per) + "%", Math.round(per2) + "%"];
}

function parseCookies(raw) {
    let cookie = raw.split(";");
    let obj = {};
    for (var i = 0; i < cookie.length; i++) {
        let data = cookie[i].split("=");
        obj[data[0].trim()] = data[1];
    }
    return obj;
}

//FUNCION: convertir a https
function seclink(url) {
    return url.replace("http://", "https://");
}

function weightRandom(data){
	let elements = new Array();
	let probability = new Array();
	
	for (var i=0; i<data.length; i++){
		elements.push(data[i][0]);
		probability.push(data[i][1]);
	}
	
	let total = eval(probability.join("+"));
	let weighted = new Array();
	let current = 0;
	while(current < probability.length){
		for(i=0; i<probability[current]; i++){
			weighted[weighted.length] = elements[current];
		}
		current++;
	}
	let random = Math.floor(Math.random() * total);
	return weighted[random];
}

function randomNoCom(){
	let frases = [
		`<img src="/assets/icon.png" style="width: 15px; height: 15px"></img> Dejá un comentario <img src="/assets/icon.png" style="width: 15px; height: 15px"></img>`,
		"No hay comentarios acá...",
		"No hay comentarios :sad:",
		"No hay comentarios",
		"No hay comentarios, dejá uno."
	];
	
	return frases[Math.floor(Math.random() * frases.length)];
}

module.exports = {randomNoCom, isTagOp, isDataImage, seclink, isGif, isImg, isVideo, clone, getCategoryData, filterComMedia, getCatShow, timeSince, formatBytes, getPollPercent, genCID, uuidv4, randomString, parseCookies, genColor, xmur3, embed2url: youtube.embed2url, weightRandom};