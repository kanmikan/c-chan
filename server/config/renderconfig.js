require('dotenv').config();
module.exports = {
	/* MODULOS DEL RENDER */
	/* info de la version del motor para mostrar en el cliente */
	VERSION: "Cchan Alfa 4",
	
	/* usar la interfaz v1 de mikanchan en vez de la clasica. */
	ENABLE_V1: (process.env.V1 && process.env.V1 === "true") ? true : false,
	
	/* (deprecated: no se va a implementar en cchan) activar botones y accesos de las comunidades */
	ENABLE_COMMUNITIES: false,
	
	/* esto desincroniza el orden de los comentarios enviados, pero da el efecto de carga instantanea en el emisor, es necesario invalidar la cache. */
	ASYNC_COMMENTS: false,
	
	/* boton con funciones extra para los comentarios */
	ENABLE_COMMENT_TOOLS: false

}
