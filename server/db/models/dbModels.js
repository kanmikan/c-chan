function HOME_QUERY(uid){
	return [
		["jerarquia", {uid: uid}, ""],
		["boxs", "", {sticky: -1, bump: -1}],
		["notificaciones", {uid: uid}, {tiempo: -1}],
		["categorias", "", {sticky:-1, order: -1}]
	];
}

module.exports = {HOME_QUERY};