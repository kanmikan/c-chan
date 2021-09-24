/* SE ENCARGA DE FILTRAR EL CONTENIDO OCULTO POR EL USER */

function filterBoxHides(boxs, userConfig){
	let boxhides = userConfig.boxhides;
	let cathides = userConfig.cathides;
	return boxs.filter(item => (!cathides.includes(item.cat) && !boxhides.includes(item.bid)));
}

module.exports = {filterBoxHides}