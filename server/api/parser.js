const dbManager = require('../db/dbManager');

/* MANEJO DE TAGS, COMANDOS, ETC. DENTRO DE LOS CAMPOS DE ENTRADA. */

function parseInput(rawtext){
	//si... por ahora no manipula nada
	
	parseTags(rawtext); //obligatoriamente, se invoca el parser de tags aunque no se utilize la informacion de retorno.
	return rawtext;
}

function parseTags(rawtext){
	//se encarga de detectar los tags y actualizar la informacion en la base de datos..
	return []; //por defecto, no hay tags
}

module.exports = {parseInput, parseTags}