/* SE ENCARGA DE FILTRAR EL CONTENIDO OCULTO POR EL USER */

function filterBoxHides(boxs, userConfig){
	let boxhides = userConfig.boxhides;
	return boxs.filter(item => !boxhides.includes(item.bid));
}

module.exports = {filterBoxHides}