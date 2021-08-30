/* MANEJO DE SUBIDA DE ARCHIVOS, SERVIDORES, ETC. */
const fs = require('fs');
const thumb = require('image-thumbnail');
const imgur = require('imgur');
const request = require("request");
const sConfig = require('../config/serverConfig');
const utils = require('../utils');

//MUESTRA: subida de archivos, esto se encargaría de seleccionar el servidor configurado por el host, etc.
function upload(file, callback){
	switch(sConfig.IMG_SERVER){
		case 0:
			//subida local
			localStore(file, callback);
			break;
		case 1:
			//imgur
			imgurUpload(file, callback);
			break;
		case 2:
			//imgbb
			callback({success: false, data: "-no implementado-"});
			break;
		case 3:
			//cloudinary
			callback({success: false, data: "-no implementado-"});
			break;
	}
}

//FUNCION: subida de imagenes al server localName
//TODO: comprobar mime/type del archivo, tamaño, etc etc.
function localStore(file, callback){
	var buffer = fs.readFileSync(file.path);
	var filename = utils.randomString(16) + "." + file.type.split("/")[1];
	var path = __dirname + '../../../uploads/' + filename;
	var external_path = "/uploads/" + filename;
    
	writeFile(path, buffer, function(err){
		if (err){
			callback({success: false, data: err});
		} else {
			genLocalThumb(path, filename, function(resthumb){
				if (resthumb){
					callback({success: true, data: {link: external_path, thumb: resthumb}});
				} else {
					callback({success: false, data: "Hubo un error al subir la imagen."});
				}
			});
		}
	});
}

//FUNCION: escribe un buffer en un archivo
function writeFile(path, buffer, callback){
	fs.writeFile(path, buffer, function(err){
		if (err){
			callback(err);
		} else {
			callback(null);
		}
	});
}

//FUNCION: genera thumbnails de imagenes locales.
function genLocalThumb(path, filename, callback){
	let name = filename.split(".");
	let thumbPath = __dirname + '../../../uploads/' + name[0] + "_thumb." + name[1];
	
	//generar thumbnail
	thumb(path, {percentage: sConfig.IMG_LOCAL_THUMBNAIL_CONFIG}).then(function(thumbnailBuffer){
		writeFile(thumbPath, thumbnailBuffer, function(rerr){
			if (!rerr){
				callback("/uploads/" + name[0] + "_thumb." + name[1]);
			} else {
				callback(null);
			}
		});
	}).catch(function(err){
		callback(null);
	});
}

function imgurUpload(file, callback){
	imgur.uploadFile(file.path).then((json) => {
		let thumb = genImgurThumb(json.link, sConfig.IMGUR_THUMBNAIL_QUALITY);
		callback({success: true, data: {link: json.link, thumb: thumb}});
	}).catch((err) => {
		callback({success: false, data: err.message});
	});	
}

//FUNCION: detectar si la url es imgur o cloudinary
function checkURLType(url){
	if (url.search("i.imgur.com") != -1){
		return "imgur";
	} else if (url.search("res.cloudinary.com") != -1){
		return "cloudinary";
	} else if (url.search("i3.ytimg.com") != -1) {
		return "youtube-img";
	} else if (url.search("youtube.com/embed") != -1) {
		return "youtube-embed";
	} else {
		return "generic";
	}
}

//FUNCION: detecta la url y devuelve el thumbnail
function genThumb(url){
	switch(checkURLType(url)){
		case "imgur":
			return genImgurThumb(url, sConfig.IMGUR_THUMBNAIL_QUALITY);
		case "cloudinary":
			return genCloudyThumb(url);
		case "youtube-img":
			console.log(url);
			return url;
		case "youtube-embed":
			return genYoutubeThumb(url, "hq");
		case "generic":
			return url;
	}
}

//FUNCION: obtiene el thumbnail de un video de youtube
function genYoutubeThumb(url, quality){
	var id = youtubeParser(url);
	return (id) ? "http://i3.ytimg.com/vi/" + id + "/" + quality + "default.jpg" : "/assets/logo.png";
}

//FUNCION: obtiene el id del video de youtube
function youtubeParser(url){
	let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	let match = url.match(regExp);
	return (match && match[2].length == 11) ? match[2] : null;
}

//FUNCION: generar thumbnails de imgur
function genImgurThumb(url, quality){
	let v1 = url.split(".");
	let v2 = v1[v1.length-1];
	let v3 = v2.length+1;
	let res = url.slice(0, -(v3));
	return res + quality + "." + v2;
}

//FUNCION: genera thumbnails de cloudinary
function genCloudyThumb(url){
	let n = url.split("/");
	let sliceA = url.slice(0, url.lastIndexOf("/"));
	return url.slice(0, sliceA.lastIndexOf("/")) + sConfig.CLOUDINARY_THUMBNAIL_CONFIG + n[n.length - 2] + "/" + n[n.length - 1];
}

module.exports = {upload, genThumb, checkURLType, genImgurThumb, genYoutubeThumb}