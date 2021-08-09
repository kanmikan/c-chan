const mdbScheme = require('./mdbScheme');

function HOME_QUERY(uid){
	return [
		[mdbScheme.C_ADM, {uid: uid}, ""],
		[mdbScheme.C_BOXS, "", {sticky: -1, bump: -1}],
		[mdbScheme.C_NOTIF, {uid: uid}, {tiempo: -1}],
		[mdbScheme.C_CATS, "", {sticky:-1, order: -1}]
	];
}

module.exports = {HOME_QUERY};