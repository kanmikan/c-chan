let n=0;
let enableSlide = (document.getElementById("slidecontainer").children.length > 1);
let MAX = document.getElementById("slidecontainer").children.length - 1;
slideshow(n);


function slideshow(index){
	let element = document.getElementById("slide" + index);
	element.classList.remove("hidden-anim");
	if (enableSlide){
		setTimeout(function(){
			element.classList.add("hidden-anim");
			if (n >= MAX) {n=0;} else {n++;}
			slideshow(n);
		}, 5000);
	}
}