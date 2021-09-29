const mdbScheme = require('./mdbscheme.js');

/* QUERY DE DATOS NECESARIOS PARA LA HOME DE CCHAN */
/* PARAMETROS: uid - id del usuario que esta realizando la query, utilizada para obtener los datos de administracion y notificaciones */
function HOME_QUERY(uid){
	return [
		[mdbScheme.C_ADM, "", "", 0],
		[mdbScheme.C_BOXS, "", {"date.sticky": -1, "date.bump": -1}, 24], //la primera carga de la home aligerada.
		[mdbScheme.C_NOTIF, {"receiver.uid": uid}, {"date.created": -1}, 0],
		[mdbScheme.C_CATS, "", {"date.sticky": -1, "date.order": -1}, 0]
	];
}

function CAT_QUERY(uid, cat){
	return [
		[mdbScheme.C_ADM, "", "", 0],
		[mdbScheme.C_BOXS, {cat: cat}, {"date.sticky": -1, "date.bump": -1}, 41],
		[mdbScheme.C_NOTIF, {"receiver.uid": uid}, {"date.created": -1}, 0],
		[mdbScheme.C_CATS, "", {"date.sticky": -1, "date.order": -1}, 0]
	];
}

function BOX_QUERY(uid, bid){
	return [
		[mdbScheme.C_ADM, {uid: uid}, "", 0],
		[mdbScheme.C_BOXS, {bid: bid}, {"date.bump": -1}, 0],
		[mdbScheme.C_NOTIF, {"receiver.uid": uid}, {"date.created": -1}, 0],
		[mdbScheme.C_CATS, "", {"date.sticky": -1, "date.order": -1}, 0],
		[mdbScheme.C_COMS, {bid: bid}, {"date.created": -1}, 0]
	];
}

module.exports = {HOME_QUERY, CAT_QUERY, BOX_QUERY};