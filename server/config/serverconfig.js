module.exports = {
	DBNAME: "mikandbv2",
	DBURL: "mongodb://127.0.0.1:27017",
	SSL: false,
	PORT: process.env.PORT || 3000,
	SESSION_SECRET: process.env.SESSION_SECRET || "test",
	
	/* CONFIGURACION DE SERVIDORES DE IMAGEN */
	IMG_SERVER: 0, //0: local, 1: imgur, 2: imgbb, 3: cloudinary
	IMG_LOCAL_THUMBNAIL_SIZE: 300, //300px
	IMGUR_THUMBNAIL_QUALITY: "m", //l: large m: medium, etc.
	CLOUDINARY_THUMBNAIL_CONFIG: "/c_scale,pg_1,w_200,f_auto/",
	
	/* DELAYS ENTRE OTROS */
	COMMENT_DELAY: 5, //tiempo de espera en segundos (5 segundos)
	BOX_DELAY: 30,
	MAX_TAGS: 5 //maximo numero de tagueos permitidos.
}
