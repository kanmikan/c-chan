/* MANEJO DE LA API DE YOUTUBE */
const sConfig = require('../config/serverconfig.js');
const YouTube = require('youtube-node');
var ytb = new YouTube();
ytb.setKey(sConfig.YOUTUBE_API_KEY);

//FUNCION: obtiene informacion del video especifico, requiere la api de youtube.
function getVideoData(id, callback){
	ytb.getById(id, function(err, result){
		if (err){
			if (callback) callback(null);
			return null;
		} else {
			if (callback) callback(result.items[0]);
			return result.items[0];
		}
	});
}

//FUNCION: obtiene el thumbnail de un video de youtube
function genYoutubeThumb(url, quality){
	var id = youtubeParser(url);
	return (id) ? "https://i3.ytimg.com/vi/" + id + "/" + quality + "default.jpg" : "/assets/logo.png";
}

//FUNCION: obtiene el id del video de youtube
function youtubeParser(url){
	let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	let match = url.match(regExp);
	return (match && match[2].length == 11) ? match[2] : null;
}

module.exports = {getVideoData, genYoutubeThumb, youtubeParser}