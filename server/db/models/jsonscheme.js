const COMMENT_SCHEME = {
	version: 2,
	cid: "cid",
	bid: "bid",
	user: {
		uid: "uid",
		jerarquia: {
			nick: "Anonimo",
			rango: "anon",
			color: ""
		}
	},
	type: [],
	flag: [],
	date: {
		created: 0
	},
	icon: "/assets/anon/1.png",
	img: {
		preview: "",
		full: "",
		raw: ""
	},
	media: {
		preview: "",
		raw: ""
	},
	content: {
		body: "content",
		extra: {
			tags: [],
			idunico: {
				id: "idunico",
				color: "idcolor"
			},
			poll: {
				voted: false,
				optionId: 0,
				optionText: ""
			}
		}
	}
}

const BOX_SCHEME = {
	version: 2, //variable indicativa de la version del modelo de la base de datos. Utilizada para añadir compatibilidad con versiones antiguas y no tener que borrar todo a la mrd.
	bid: "bid",
	cat: "cat",
	user: {
		uid: "uid",
		jerarquia: {} //datos incrustados de jerarquia.
	},
	type: [], //poll, dice, video, object
	flag: [],
	date: {
		created: 0, //timestamp de fecha de creacion.
		bump: 0, //timestamp de ultimo bump.
		sticky: 0, //me olvide de añadir estos..
		csticky: 0
	},
	img: {
		preview: "/assets/logo.png", //version optimizada de la imagen para uso como thumbnail.
		full: "/assets/logo.png", //imagen original subida en un servidor local.
		raw: "" //imagen original del sitio procedente, si existe.
	},
	media: {
		preview: "", //thumbnail del video/multimedia
		raw: "" //link directo al video/multimedia
	},
	content: { //contenido del tema.
		title: "title",
		body: "content",
		comments: 0, //se incrusta una referencia de la cantidad de comentarios en el box.
		extra: { //datos especiales dependiendo del tipo de box.
			title2: "", //segundo titulo, caracteristica unica de mikanchan
			poll: { //datos extra perteneciente a una encuesta.
				pollOne: "opcion 1",
				pollOneV: 0,
				pollTwo: "opcion 2",
				pollTwoV: 0,
				pollVotes: [ //los votos de la encuesta se almacenan en el mismo box.
					["uid", 1],
					["uid", 2]
				]
			}
		}
	}
};

const USER_SCHEME = {
	version: 2,
	uid: "uid",
	sid: "id de sesion",
	nick: "Anonimo",
	rango: "anon",
	color: "",
	pass: "",
	token: "",
	permisos: ["CREAR_BOX", "CREAR_COM"],
	state: [],
	extra: {
		bandata: {
			ip: "",
			fecha: 0,
			duracion: 0,
			razon: ""
		}
	}
}

const NOTIF_SCHEME = {
	version: 2,
	type: [], 
	state: [], //placeholder para un sistema de guardado de notificaciones viejas.
	sender: { //datos del emisor del comentario.
		uid: "suid"
	},
	receiver: { //datos del que recibe la notificacion
		uid: "ruid"
	},
	date: { //timestamp del momento en que se envió
		created: 0
	},
	content: { //datos de la notificacion.
		cid: "cid",
		bid: "bid",
		tag: false, //si es una notificacion de tag.
		preview: {
			title: "title",
			desc: "descripcion o fragmento del comentario.",
			thumb: "thumb"
		}
	}
}

const CATEGORY_SCHEME = {
	version: 2,
	catid: "off",
	type: 0, //0: categoria, 1: comunidad
	state: [],
	date: {
		created: 0,
		order: 0,
		sticky: 0
	},
	content: {
		tid: "OFF",
		name: "Off Topic",
		description: "Temas Mixtos",
		media: {
			icon: "/assets/cat/icon/off.jpg",
			image: "/assets/cat/off.jpg",
			misc: []
		},
		extra: {
			cardtitlestyle: "",
			cardbgstyle: "",
			cardmsg: ""
		}
	}
}

const SVRCONFIG_SCHEME = {
	version: 2,
	whitelist: false, //permitir el uso solo a los usuarios con whitelist o con rango.
	whitewall: false, //permitir el acceso solo a usuarios con whitelist o rango.
	login: true, //permitir logeos
	coms: true, //permitir comentarios
	boxs: true, //permitir creacion de temas
	blacklist: [] //[placeholder] blacklist de acceso general.
}

module.exports = {COMMENT_SCHEME, BOX_SCHEME, USER_SCHEME, NOTIF_SCHEME, CATEGORY_SCHEME, SVRCONFIG_SCHEME}