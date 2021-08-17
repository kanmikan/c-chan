/* FUNCIONES UTILITARIAS DE USO EN EL SERVER Y EN EL RENDER */
function getCategoryData(categorias, tid){
	return categorias.filter( item => item.tid === tid)[0];
}

function getCatShow(categoria){
	//añadir parametros especiales a las categorias, ejemplo: oficial
	if (categoria === "oficial"){return "<span>Oficial</span>";}
	return categoria.toUpperCase();
}

module.exports = {getCategoryData, getCatShow};