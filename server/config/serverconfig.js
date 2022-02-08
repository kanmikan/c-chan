require('dotenv').config();
module.exports = {
	DBNAME: process.env.DBNAME || "mikandbv2",
	DBURL: process.env.MONGOURI || "mongodb://127.0.0.1:27017",
	SSL: (process.env.SSL && process.env.SSL === "true") ? true : false,
	PORT: process.env.PORT || 3000,
	SESSION_SECRET: process.env.SESSION_SECRET || "test",
	DATABASE_CACHE: (process.env.DATABASE_CACHE && process.env.DATABASE_CACHE === "false") ? false : true,
	STATIC_CACHE_VALUE: {}, //{maxAge: 3600000*12}
	CRON_THREADS: (process.env.CRON_THREADS && process.env.CRON_THREADS === "true") ? true : false,
	CRON_HEARTBEAT: '*/5 * * * *', //cada 5 minutos
	
	/* APIS EXTERNAS */
	YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
	
	/* CONFIGURACION DE SERVIDORES DE IMAGEN/VIDEO */
	UPLOAD_MAX_SIZE: 53000000, //tamaño maximo de subidas (en bytes)
	IMG_SERVER: parseInt(process.env.IMG_SERVER) || 0, //0: local, 1: imgur, 2: imgbb, 3: cloudinary, 4: imgbox
	VIDEO_SERVER: parseInt(process.env.VIDEO_SERVER) || 0, //0: local, 1: cloudinary
	IMG_LOCAL_THUMBNAIL_SIZE: 300, //300px
	IMGUR_THUMBNAIL_QUALITY: "m", //l: large m: medium, etc.
	/* CLOUDINARY */
	CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
	CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
	CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
	CLOUDINARY_THUMBNAIL_CONFIG: "/c_scale,pg_1,w_300,f_auto/",
	/* IMGBB */
	IMGBB_API_KEY: process.env.IMGBB_API_KEY,
	/* IMGBOX */
	IMGBOX_THUMBNAIL_CONFIG: "350r",
	
	/* DELAYS ENTRE OTROS */
	COMMENT_DELAY: 5, //tiempo de espera en segundos (5 segundos)
	BOX_DELAY: 120,
	MAX_TAGS: 5, //maximo numero de tagueos permitidos.
	/* LIMITES */
	HOME_BOX_LIMIT: 48, //limite de la carga inicial (no aplica a la v1)
	HOME_BOX_PAGELOAD: 20, //cantidad de boxs a cargar en cada paginación.
	CATEGORY_BOX_LIMIT: 82, //maximo de temas en una categoría.
	
	/* OTROS */
	RTF_BOXS: false, //aceptar formato de texto enriquecido en los temas.
	ENABLE_POSTS: false //formato de posts.
	
}
