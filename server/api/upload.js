/* MANEJO DE SUBIDA DE ARCHIVOS, SERVIDORES, ETC. */
const fs = require('fs');
const sharp = require('sharp');
const imgur = require('imgur');
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
const sConfig = require('../config/serverconfig.js');
const utils = require('../utils.js');
const youtube = require('./youtube.js');
const cloudy = require('./cloudinary.js');

//FUNCION: subida de imagenes, esto se encargaría de seleccionar el servidor configurado por el host, etc.
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
			cloudyUpload(file, callback);
			break;
	}
}

//FUNCION: subida de videos
function uploadVid(file, callback){
	//todo: opciones de subida local, o subida a cloudinary
	localStore(file, callback);
}

//FUNCION: subida de archivos al server local
function localStore(file, callback){
	let buffer = fs.readFileSync(file.path);
	let filename = utils.randomString(16) + "." + file.type.split("/")[1];
	let path = process.cwd() + "/uploads/" + filename;
	let external_path = "/uploads/" + filename;
    
	writeFile(path, buffer, function(err){
		if (err){
			callback({success: false, data: err});
		} else {
			if (file.type.split("/")[0] === "video"){
				let thumbname = filename.split(".")[0] + "_thumb.png";
				let thumb_path = process.cwd() + "/uploads/";
				ffmpeg(path).setFfmpegPath(ffmpeg_static)
				.screenshots({
					timestamps: [0.0],
					filename: thumbname,
					folder: thumb_path,
					size: '?x250'
				}).on('end', function() {
					callback({success: true, data: {link: external_path, thumb: "/uploads/" + thumbname}});
				});
			} else {
				genLocalThumb(path, filename, function(resthumb){
					if (resthumb){
						callback({success: true, data: {link: external_path, thumb: resthumb}});
					} else {
						callback({success: false, data: "Hubo un error al subir la imagen."});
					}
				});
			}
			
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
	
	//pasar formato a webp
	name[1] = "webp";
	//let thumbPath = __dirname + '../../../uploads/' + name[0] + "_thumb." + name[1];
	let thumbPath = process.cwd() + "/uploads/" + name[0] + "_thumb." + name[1];
	sharp(path)
	.resize(sConfig.IMG_LOCAL_THUMBNAIL_SIZE)
	.webp({quality: 90})
	.toBuffer()
	.then(function(data){
		writeFile(thumbPath, data, function(rerr){
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

function cloudyUpload(file, callback){
	cloudy.uploadImg(file, function(data){
		callback(data);
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
			return cloudy.genCloudyThumb(url);
		case "youtube-img":
			return url;
		case "youtube-embed":
			return youtube.genYoutubeThumb(url, "hq");
		case "generic":
			return url;
	}
}

//FUNCION: generar thumbnails de imgur
function genImgurThumb(url, quality){
	let v1 = url.split(".");
	let v2 = v1[v1.length-1];
	let v3 = v2.length+1;
	let res = url.slice(0, -(v3));
	return res + quality + "." + v2;
}

module.exports = {upload, uploadVid, genThumb, checkURLType, genImgurThumb}