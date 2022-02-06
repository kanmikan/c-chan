/* MANEJA LOS ICONOS DE COMENTARIOS, SU FRECUENCIA, ETC */
const utils = require('../utils.js');

// amarillo, azul, verde, rojo, multi, invertido, black, especial, white
const P = [90, 90, 90, 90, 20, 20, 3, 1, 3];
//const P = [1, 1, 1, 1, 0.5, 0.5, 0.05, 0.005, 0.05];//deprecated

//FUNCION: se encarga de elegir que set de anons usar, dependiendo de variables como los dias festivos, etc.
//TODO: detector de fechas festivos, navidad, etc.
function genAnon(type){	
	if (type.includes("dice")){
		return pickDadosAnon();
	} else {
		return pickCSSAnon(); //TODO: or (isFiestas(timestamp) then pickNavidadAnon())
	}
}

function pickCSSAnon(){
	return utils.weightRandom([
		["ico,#FFcc00,#ffffff, ,ANON, ", P[0]],
		["ico,#1545e6,#ffffff, ,ANON, ", P[1]],
		["ico,#02b13c,#ffffff, ,ANON, ", P[2]],
		["ico,#df0202,#ffffff, ,ANON, ", P[3]],
		["class,anonMulti,white, ,ANON, ", P[4]],
		["class,anonInvertido,white, ,ANON, ", P[5]],
		["ico,#000000,#ffffff, ,ANON, ", P[6]],
		["/assets/anon/yuu.png", P[7]],
		["ico,#ffffff,#000000, ,ANON, ", P[8]]
	]);
}

//Set de navidad
function pickNavidadAnon(){
	let pickColor = Math.floor(Math.random() * 4);
	pickColor = (pickColor != 0) ? pickColor : 1;
	let itemType = (Math.floor(Math.random() * 2) === 0) ? "hhat navidadhat" : "hitem navidadbadge";
	
	return utils.weightRandom([
		["ico,#FFcc00,#ffffff," + itemType + pickColor, P[0]],
		["ico,#1545e6,#ffffff," + itemType + pickColor, P[1]],
		["ico,#02b13c,#ffffff," + itemType + pickColor, P[2]],
		["ico,#df0202,#ffffff," + itemType + pickColor, P[3]],
		["class,anonMulti,white," + itemType + pickColor, P[4]],
		["class,anonInvertido,white," + itemType + pickColor, P[5]],
		["ico,#000000,#ffffff," + itemType + pickColor, P[6]],
		["ico,#ffffff,#000000," + itemType + pickColor, P[8]]
	]);
}

//Set de dados
function pickDadosAnon(){
	let randomNumber = Math.floor(Math.random() * 9);
	return utils.weightRandom([
		["ico,#FFcc00,#ffffff, ," + randomNumber + ",dados", P[0]],
		["ico,#1545e6,#ffffff, ," + randomNumber + ",dados", P[1]],
		["ico,#02b13c,#ffffff, ," + randomNumber + ",dados", P[2]],
		["ico,#df0202,#ffffff, ," + randomNumber + ",dados", P[3]],
		["class,anonMulti,dados white, ," + randomNumber + ", ", P[4]],
		["class,anonInvertido,dados white, ," + randomNumber + ", ", P[5]],
		["ico,#000000,#ffffff, ," + randomNumber + ",dados", P[6]],
		["ico,#ffffff,#000000, ," + randomNumber + ",dados", P[8]]
	]);
}

module.exports = {genAnon}
