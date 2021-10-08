/* SE ENCARGA DE FILTRAR EL CONTENIDO OCULTO POR EL USER */

function filterBoxHides(boxs, userConfig){
	let boxhides = (userConfig.boxhides) ? userConfig.boxhides : [];
	let cathides = (userConfig.cathides) ? userConfig.cathides : [];
	return boxs.filter(item => (!cathides.includes(item.cat) && !boxhides.includes(item.bid)));
}

function filterOnlyHides(boxs, userConfig){
	return filterBoxHides(boxs, {boxhides: userConfig.boxhides, cathides: []});
}

module.exports = {filterBoxHides, filterOnlyHides}