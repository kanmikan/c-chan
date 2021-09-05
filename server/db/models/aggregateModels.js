module.exports = {
	HOME_QUERY : [
		{$lookup: {from: 'jerarquia', localField: 'uid', foreignField: 'uid', as: 'jerarquia'}},
		{$lookup: {from: 'notificaciones', localField: 'uid', foreignField: 'uid', as: 'notificaciones'}},
		{$lookup: {from: 'categorias', localField: '', foreignField: '', as: 'categorias', pipeline: [{$sort: {sticky: -1, order: -1}}] }},
		{$sort: {sticky: -1, bump: -1}}
	],
	TEST : [
		{$lookup: {from: 'comentarios', localField: 'bid', foreignField: 'bid', as: 'comentarios'}},
		{$lookup: {from: 'notificaciones', localField: 'uid', foreignField: 'uid', as: 'notificaciones'}},
		{$match: {cat: "gmr"}},
		{$sort: {bump: -1}}
	]	
}