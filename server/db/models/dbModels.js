const mdbScheme = require('./mdbScheme');

/* QUERY DE DATOS NECESARIOS PARA LA HOME DE CCHAN */
/* PARAMETROS: uid - id del usuario que esta realizando la query, utilizada para obtener los datos de administracion y notificaciones */
function HOME_QUERY(uid){
	return [
		[mdbScheme.C_ADM, {uid: uid}, "", 0],
		[mdbScheme.C_BOXS, "", {sticky: -1, bump: -1}, 41], //limite de 41 elementos hardcodeado en el query.
		[mdbScheme.C_NOTIF, {uid: uid}, {tiempo: -1}, 0],
		[mdbScheme.C_CATS, "", {sticky:-1, order: -1}, 0]
	];
}

function BOX_QUERY(uid, bid){
	return [
		[mdbScheme.C_ADM, {uid: uid}, "", 0],
		[mdbScheme.C_BOXS, {bid: bid}, {bump: -1}, 0],
		[mdbScheme.C_NOTIF, {uid: uid}, {tiempo: -1}, 0],
		[mdbScheme.C_CATS, "", {sticky: -1, order: -1}, 0],
		[mdbScheme.C_COMS, {bid: bid}, {tiempo: -1}, 0],
		[mdbScheme.C_ENC, {bid: bid, uid: uid}, "", 0]
	];
}

module.exports = {HOME_QUERY, BOX_QUERY};