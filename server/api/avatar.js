/* MANEJA LOS ICONOS DE COMENTARIOS, SU FRECUENCIA, ETC */

function genAnon(){
	//se encarga de elegir que set de anons usar, dependiendo de variables como los dias festivos, etc.
	return pickSVGAnon();
	
}

//TODO: soporte de iconos animados.
function pickSVGAnon(){
	let anone = [
		["ico,#FFCC33,#ffffff", 1], //amarillo
		["ico,#006699,#ffffff", 1], //azul
		["ico,#009933,#ffffff", 1], //verde
		["ico,#CA0000,#ffffff", 1], //rojo
		["/assets/anon/5.gif", 0.1], //multi
		["/assets/anon/6.gif", 0.1], //invertido
		["ico,#000000,#ffffff", 0.01], //black
		["/assets/anon/5.gif", 0.001], //uff
		["ico,#ffffff,#000000", 0.01] //white
	];
	return weightRandom(anone);
}

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
		["/assets/anon/5.gif", 0.001], //uff
		["/assets/anon/5.gif", 0.01] //white
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
