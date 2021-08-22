/* MANEJO DE SUBIDA DE ARCHIVOS, SERVIDORES, ETC. */
const imgur = require('imgur');

//MUESTRA: subida de archivos, esto se encargaría de seleccionar el servidor configurado por el host, etc.
function upload(file, callback){
	//uso imgur como servidor de muestra.
	imgur.uploadFile(file.path).then((json) => {
		let thumb = genImgurThumb(json.link);
		callback({success: true, data: {link: json.link, thumb: thumb}});
	}).catch((err) => {
		callback({success: false, data: err.message});
	});	
}

//funcion utilitaria para generar thumbnails de imgur
function genImgurThumb(url){
	//l : large, usamos el thumbnail de mejor calidad.
	let v1 = url.split(".");
	let v2 = v1[v1.length-1];
	let v3 = v2.length+1;
	let res = url.slice(0, -(v3));
	return res + "l." + v2;
}

module.exports = {upload}