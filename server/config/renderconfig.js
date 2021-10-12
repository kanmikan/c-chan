require('dotenv').config();
module.exports = {
	/* MODULOS DEL RENDER */
	/* usar la interfaz v1 de mikanchan en vez de la clasica. */
	ENABLE_V1: ((process.env.V1 === "true") ? true : false) || false,
	
	/* activar o desactivar las tarjetas separadoras de categorias */
	V1_CARDS: ((process.env.V1_CARDS === "true") ? true : false) || true,
	
	/* activar botones y accesos de las comunidades */
	ENABLE_COMMUNITIES: false,
	
	/* esto desincroniza el orden de los comentarios enviados, pero da el efecto de carga instantanea en el emisor, es necesario invalidar la cache. */
	ASYNC_COMMENTS: false,
	
	/* permite mostrar el icono de la categoria en la lista de temas */
	SHOW_CATEGORY_ICON: false
}
