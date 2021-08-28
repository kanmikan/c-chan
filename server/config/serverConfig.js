module.exports = {
	DBNAME: "mikanchan",
	DBURL: "mongodb://127.0.0.1:27017",
	SSL: false,
	PORT: process.env.PORT || 3000,
	SESSION_SECRET: process.env.SESSION_SECRET || "test",
	
	/* CONFIGURACION DE SERVIDORES DE IMAGEN */
	IMG_SERVER: 0, //0: local, 1: imgur, 2: imgbb, 3: cloudinary
	IMGUR_THUMBNAIL_QUALITY: "m", //l: large m: medium, etc.
	CLOUDINARY_THUMBNAIL_CONFIG: "/c_scale,pg_1,w_300/" 
}
