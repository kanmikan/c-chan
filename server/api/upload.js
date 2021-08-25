/* MANEJO DE SUBIDA DE ARCHIVOS, SERVIDORES, ETC. */
const fs = require('fs');
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
    
	fs.writeFile(path, buffer, function(err){
		if (err) {
			callback({success: false, data: err});
		} else {
			
			//TODO: aca se tiene que generar el thumbnail... pero por ahora envio la imagen completa..
			callback({success: true, data: {link: external_path, thumb: external_path}});
		}
	});
}

function imgurUpload(file, callback){
	imgur.uploadFile(file.path).then((json) => {
		let thumb = genImgurThumb(json.link);
		callback({success: true, data: {link: json.link, thumb: thumb}});
	}).catch((err) => {
		callback({success: false, data: err.message});
	});	
}

//funcion utilitaria para generar thumbnails de imgur
function genImgurThumb(url){
	let v1 = url.split(".");
	let v2 = v1[v1.length-1];
	let v3 = v2.length+1;
	let res = url.slice(0, -(v3));
	return res + sConfig.IMGUR_THUMBNAIL_QUALITY + "." + v2;
}

module.exports = {upload}