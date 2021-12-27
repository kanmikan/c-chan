// Set date
var countdownDate = new Date("January 1, 2022 00:00:00").getTime();

// Update the count down every 1 second
var x = setInterval(function () {
	// Get todays date and time
	var now = new Date().getTime();

	// Find the distance between now and the count down date
	var distance = countdownDate - now;
	
	// Time calculations for days, hours, minutes and seconds
	var days = Math.floor(distance / (1000 * 60 * 60 * 24));
	var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	var seconds = Math.floor((distance % (1000 * 60)) / 1000);
	
	
	// If the count down is finished, write some text
	if (distance < 0) {
		clearInterval(x);
		update();
		//document.getElementById("counter").classList.add("hidden");
		document.getElementById("counter").innerHTML = "Feliz siglo 2022!";
	} else {
		// Display the result in the element
		document.querySelector("#d").innerText = addZero(days);
		document.querySelector("#h").innerText = addZero(hours);
		document.querySelector("#m").innerText = addZero(minutes);
		document.querySelector("#s").innerText = addZero(seconds);

		if (document.getElementById("counter").classList.contains("hidden")){
			document.getElementById("counter").classList.remove("hidden");
		}
	}
}, 1000);

function addZero(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

/********************
    Animation Frame
  ********************/

window.requestAnimFrame = (function () {
	return (
		window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000);
		}
	);
})();

/********************
    Vars
  ********************/
var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	cw = window.innerWidth,
	ch = 50,
	fireworks = [],
	particles = [],
	hue = 120, // starting hue
	limiterTotal = 5, // limit 5 when click trigger
	limiterTick = 0, // launch timer
	timerTotal = 80,
	timerTick = 0,
	mousedown = false,
	mx, // mouse x coordinate,
	my; // mouse y coordinate

// set canvas dimensions
canvas.width = cw;
canvas.height = ch;

/********************
    Helper Functions
  ********************/

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function calculateDistance(p1x, p1y, p2x, p2y) {
	var xDistance = p1x - p2x,
		yDistance = p1y - p2y;
	return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

/********************
    Fireworks
  ********************/
function Firework(sx, sy, tx, ty) {
	// actual coordinates
	this.x = sx;
	this.y = sy;
	// starting coordinates
	this.sx = sx;
	this.sy = sy;
	// target coordinates
	this.tx = tx;
	this.ty = ty;
	// distance from starting point to target
	this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
	this.distanceTraveled = 0;
	// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 3;
	// populate initial coordinate collection with the current coordinates
	while (this.coordinateCount--) {
		this.coordinates.push([this.x, this.y]);
	}
	this.angle = Math.atan2(ty - sy, tx - sx);
	this.speed = 2;
	this.acceleration = 1.05;
	this.brightness = random(50, 70);
	// circle target indicator radius
	this.targetRadius = 1;
}

// update firework
Firework.prototype.update = function (index) {
	// remove last item in coordinates array
	this.coordinates.pop();
	// add current coordinates to the start of the array
	this.coordinates.unshift([this.x, this.y]);
	// cycle the circle target indicator radius
	if (this.targetRadius < 8) {
		this.targetRadius += 0.3;
	} else {
		this.targetRadius = 1;
	}
	// speed up the firework
	this.speed *= this.acceleration;
	// get the current velocities based on angle and speed
	var vx = Math.cos(this.angle) * this.speed,
		vy = Math.sin(this.angle) * this.speed;
	// how far will the firework have traveled with velocities applied?
	this.distanceTraveled = calculateDistance(
		this.sx,
		this.sy,
		this.x + vx,
		this.y + vy
	);
	// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
	if (this.distanceTraveled >= this.distanceToTarget) {
		createParticles(this.tx, this.ty);
		fireworks.splice(index, 1); // remove the firework, use the index passed into the update function to determine which to remove
	} else {
		// target not reached, keep traveling
		this.x += vx;
		this.y += vy;
	}
};

// draw firework
Firework.prototype.draw = function () {
	ctx.beginPath();
	ctx.moveTo(
		this.coordinates[this.coordinates.length - 1][0],
		this.coordinates[this.coordinates.length - 1][1]
	); // move to the last tracked coordinate in the set, then draw a line to the current x and y
	ctx.lineTo(this.x, this.y);
	ctx.strokeStyle = "hsl(" + hue + ", 100%, " + this.brightness + "%)";
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2); // draw the target for this firework with a pulsing circle
	ctx.stroke();
};

/********************
    Particle Prototype
  ********************/

function Particle(x, y) {
	this.x = x;
	this.y = y;
	// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
	this.coordinates = [];
	this.coordinateCount = 5;
	while (this.coordinateCount--) {
		this.coordinates.push([this.x, this.y]);
	}
	// set a random angle in all possible directions, in radians
	this.angle = random(0, Math.PI * 2);
	this.speed = random(1, 10);
	// friction will slow the particle down
	this.friction = 0.95;
	// gravity will be applied and pull the particle down
	this.gravity = 1;
	// set the hue to a random number +-50 of the overall hue variable
	this.hue = random(hue - 50, hue + 50);
	this.brightness = random(50, 80);
	this.alpha = 1;
	// set how fast the particle fades out
	this.decay = random(0.015, 0.03);
}

Particle.prototype.update = function (index) {
	// remove last item in coordinates array
	this.coordinates.pop();
	// add current coordinates to the start of the array
	this.coordinates.unshift([this.x, this.y]);
	// slow down the particle
	this.speed *= this.friction;
	// apply velocity
	this.x += Math.cos(this.angle) * this.speed;
	this.y += Math.sin(this.angle) * this.speed + this.gravity;
	// fade out the particle
	this.alpha -= this.decay;

	// remove the particle once the alpha is low enough, based on the passed in index
	if (this.alpha <= this.decay) {
		particles.splice(index, 1);
	}
};

// draw particle
Particle.prototype.draw = function () {
	ctx.beginPath();
	ctx.moveTo(
		this.coordinates[this.coordinates.length - 1][0],
		this.coordinates[this.coordinates.length - 1][1]
	); // move to the last tracked coordinates in the set, then draw a line to the current x and y
	ctx.lineTo(this.x, this.y);
	ctx.strokeStyle =
		"hsla(" + this.hue + ", 100%, " + this.brightness + "%, " + this.alpha + ")";
	ctx.stroke();
};

// create particle group & explosion
function createParticles(x, y) {
	var particleCount = 150; // increase the particle count for a bigger explosion
	while (particleCount--) {
		particles.push(new Particle(x, y));
	}
}

/********************
    Update
  ********************/

function update() {
	requestAnimFrame(update);

	// increase the hue to get different colored fireworks over time
	//hue += 0.5;

	// create random color
	hue = random(0, 360);

	// clearRect() with opacity
	ctx.globalCompositeOperation = "destination-out";
	// decrease the alpha property to create more prominent trails
	ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
	ctx.fillRect(0, 0, cw, ch);
	// change the composite operation back to our main mode
	// lighter creates bright highlight points as the fireworks and particles overlap each other
	ctx.globalCompositeOperation = "lighter";

	// loop over each firework, draw it, update it
	var i = fireworks.length;
	while (i--) {
		fireworks[i].draw();
		fireworks[i].update(i);
	}

	// loop over each particle, draw it, update it
	var i = particles.length;
	while (i--) {
		particles[i].draw();
		particles[i].update(i);
	}

	// launch fireworks automatically to random coordinates, when the mouse isn't down
	if (timerTick >= timerTotal) {
		if (!mousedown) {
			// start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
			fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
			timerTick = 0;
		}
	} else {
		timerTick++;
	}

	// limit the rate at which fireworks get launched when mouse is down
	if (limiterTick >= limiterTotal) {
		if (mousedown) {
			// start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
			fireworks.push(new Firework(cw / 2, ch, mx, my));
			limiterTick = 0;
		}
	} else {
		limiterTick++;
	}
}

function onResize() {
	cw = window.innerWidth;
	ch = 50;
	canvas.width = cw;
	canvas.height = ch;
}

window.addEventListener("resize", onResize);

//window.onload = update;
