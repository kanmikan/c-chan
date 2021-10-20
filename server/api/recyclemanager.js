/* SE ENCARGA DE RECICLAR LOS TEMAS QUE EXCEDEN EL LIMITE MAXIMO POR CATEGORIA, ADEMAS DE ARCHIVAR TEMAS QUE CUMPLAN CIERTOS REQUISITOS. */
const sConfig = require("../config/serverconfig.js");
const dbManager = require("../db/dbmanager.js");
const mdbScheme = require("../db/models/mdbscheme.js");

//FUNCION: comprueba si la categoria especificada supera el limite de temas impuesto, elimina de la db el ultimo en la lista y devuelve el elemento eliminado.
//TODO: archivado de temas especificos.
async function recycle(DB, catid){
	let boxs = await dbManager.queryDB(DB, mdbScheme.C_BOXS, {cat: catid}, {"date.sticky": -1, "date.csticky": -1, "date.bump": -1}, function(){});
	if (boxs.length > sConfig.CATEGORY_BOX_LIMIT){
		//eliminar tema que se encuentre en la ultima posicion.
		let todelBox = boxs[boxs.length-1];
		console.log(`[Recycler] Eliminando tema ${todelBox.bid} y sus comentarios...`);
		dbManager.deleteDB(DB, mdbScheme.C_BOXS, {bid: todelBox.bid}, function(){
			dbManager.deleteDB(DB, mdbScheme.C_COMS, {bid: todelBox.bid}, function(){
				return todelBox;
			});
		});	
	}
}

module.exports = {recycle}