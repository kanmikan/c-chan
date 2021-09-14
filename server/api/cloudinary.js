/* MANEJO DEL API DE CLOUDINARY */
const cloudinary = require('cloudinary').v2;
const sConfig = require('../config/serverconfig.js');

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET
});

function uploadImg(file, callback){
	cloudinary.uploader.upload(file.path, function(error, result) {
		if (error){
			callback({success: false, data: error});
		} else {
			callback({success: true, data: {link: result.secure_url, thumb: genCloudyThumb(result.secure_url)}});
		}			
	});
}

function uploadVid(file, callback){
	
}

//FUNCION: genera thumbnails de imagenes de cloudinary
function genCloudyThumb(url){
	let n = url.split("/");
	let o = n[n.length-1].split(".");
	o[1] = ".webp"; //asignar formato webp en la url.
	let sliceA = url.slice(0, url.lastIndexOf("/"));
	return url.slice(0, sliceA.lastIndexOf("/")) + sConfig.CLOUDINARY_THUMBNAIL_CONFIG + n[n.length - 2] + "/" + o[0]+o[1];
}

module.exports = {uploadImg, uploadVid, genCloudyThumb}