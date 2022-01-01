/* MANEJA LOS ICONOS DE COMENTARIOS, SU FRECUENCIA, ETC */


//FUNCION: se encarga de elegir que set de anons usar, dependiendo de variables como los dias festivos, etc.
//TODO: detector de fechas festivos, navidad, etc.
function genAnon(type){	
	if (type.includes("dice")){
		return pickDadosAnon();
	} else {
		return pickCSSAnon(); //TODO: or (isFiestas(timestamp) then pickNavidadAnon())
	}
}

function pickNavidadAnon(){
	let pickColor = Math.floor(Math.random() * 4);
	pickColor = (pickColor != 0) ? pickColor : 1;
	let itemType = (Math.floor(Math.random() * 2) === 0) ? "hhat navidadhat" : "hitem navidadbadge";
	
	let anone = [
		["ico,#FFcc00,#ffffff," + itemType + pickColor, 1], //amarillo
		["ico,#1545e6,#ffffff," + itemType + pickColor, 1], //azul
		["ico,#02b13c,#ffffff," + itemType + pickColor, 1], //verde
		["ico,#df0202,#ffffff," + itemType + pickColor, 1], //rojo
		["class,anonMulti,white," + itemType + pickColor, 0.1], //multi
		["class,anonInvertido,white," + itemType + pickColor, 0.1], //invertido
		["ico,#000000,#ffffff," + itemType + pickColor, 0.01], //black
		["ico,#ffffff,#000000," + itemType + pickColor, 0.01] //white
	];
	return weightRandom(anone);
}

function pickDadosAnon(){
	let randomNumber = Math.floor(Math.random() * 9);
	let anone = [
		["ico,#FFcc00,#ffffff, ," + randomNumber + ",dados", 1],
		["ico,#1545e6,#ffffff, ," + randomNumber + ",dados", 1],
		["ico,#02b13c,#ffffff, ," + randomNumber + ",dados", 1],
		["ico,#df0202,#ffffff, ," + randomNumber + ",dados", 1],
		["class,anonMulti,dados white, ," + randomNumber + ", ", 0.1],
		["class,anonInvertido,dados white, ," + randomNumber + ", ", 0.1],
		["ico,#000000,#ffffff, ," + randomNumber + ",dados", 0.01],
		["ico,#ffffff,#000000, ," + randomNumber + ",dados", 0.01]
	];
	return weightRandom(anone);
}

function pickCSSAnon(){
	let anone = [
		["ico,#FFcc00,#ffffff, ,ANON, ", 1], //amarillo
		["ico,#1545e6,#ffffff, ,ANON, ", 1], //azul
		["ico,#02b13c,#ffffff, ,ANON, ", 1], //verde
		["ico,#df0202,#ffffff, ,ANON, ", 1], //rojo
		["class,anonMulti,white, ,ANON, ", 0.1], //multi
		["class,anonInvertido,white, ,ANON, ", 0.1], //invertido
		["ico,#000000,#ffffff, ,ANON, ", 0.01], //black
		["/assets/anon/yuu.png", 0.001], //yuu
		["ico,#ffffff,#000000, ,ANON, ", 0.01] //white
	];
	return weightRandom(anone);
}

//deprecated
function pickDefaultAnon(){
	//elemento, porcentaje de chance
	let anone = [
		["/assets/anon/1.png", 1], //amarillo
		["/assets/anon/2.png", 1], //azul
		["/assets/anon/3.png", 1], //verde
		["/assets/anon/4.png", 1], //rojo
		["/assets/anon/5.gif", 0.1], //multi
		["/assets/anon/6.gif", 0.1], //invertido
		["/assets/anon/7.png", 0.01], //black
		["/assets/anon/8.png", 0.001], //uff
		["/assets/anon/9.png", 0.01] //white
	];
	return weightRandom(anone);
}

function weightRandom(data){
	let elements = new Array();
	let probability = new Array();
	
	for (var i=0; i<data.length; i++){
		elements.push(data[i][0]);
		probability.push(data[i][1]);
	}
	
	let total = eval(probability.join("+"));
	let weighted = new Array();
	let current = 0;
	while(current < probability.length){
		for(i=0; i<probability[current]; i++){
			weighted[weighted.length] = elements[current];
		}
		current++;
	}
	let random = Math.floor(Math.random() * total);
	return weighted[random];
}

module.exports = {genAnon}
