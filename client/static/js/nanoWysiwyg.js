function toolBold(){
	document.execCommand("bold", false, null);
}

function toolItalic(){
	document.execCommand("italic", false, null);
}

function toolAlignCenter(){
	document.execCommand("justifyCenter", false, null);
}

function toolAlignLeft(){
	document.execCommand("justifyLeft", false, null);
}

function toolAlignRight(){
	document.execCommand("justifyRight", false, null);
}

function toolImage(){
	document.getElementById("toolImageFile").click();
}

function toolURL(){
	let url = prompt("Link", "https://");
	if (url){
		document.execCommand("createLink", false, url);
	}
}

function toolRemoveFormat(){
	document.execCommand("removeFormat", false, null);
}

function toolGT(){
	document.execCommand("insertHTML", false, `&gt;`);
}

function toolMedia(data){
	if (data.video){
		let videoObject = `</br><div class="video-container"><iframe width="560" height="315" src="${data.raw}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></br>`;
		document.execCommand("insertHTML", false, videoObject);
	} else {
		let imageObject = `<img class="lazy attImage" alt="post image" data-img="${data.raw}|${data.thumb}" data-src="${(isGif(data.raw)) ? data.raw : data.thumb}" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAQAAAA3fa6RAAAADklEQVR42mNkAANGCAUAACMAA2w/AMgAAAAASUVORK5CYII=" onerror="this.src='/assets/imageplaceholder.png'"></img>`;
		document.execCommand("insertHTML", false, imageObject);
	}
}

function toolYoutube(){
	element("richEditor").focus();
	let url = prompt("Url de youtube/link a imagen/etc.", "");
	if (url){
		let formData = new FormData();
		formData.append("link", url);
		post(formData, "/api/uplink", function(target){
			element("ytLIcon").classList.remove("hidden");
			element("ytIcon").classList.add("hidden");
		}, function(data){
			element("ytLIcon").classList.add("hidden");
			element("ytIcon").classList.remove("hidden");
			if (data.success){
				if (data.data.type === "youtube-url"){
					let code = `</br><div class="video-container"><iframe width="560" height="315" src="${data.data.raw}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></br>`;
					document.execCommand("insertHTML", false, code);
				} else if (!data.data.video) {
					let full = data.data.raw;
					let preview = data.data.thumb;
					let imageObject = `</br><div class="attImage"><img class="lazy" data-src="${(isGif(full)) ? full : preview}" data-img="${preview}|${full}" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAACCAQAAAA3fa6RAAAADklEQVR42mNkAANGCAUAACMAA2w/AMgAAAAASUVORK5CYII="></img></div></br>`;

					document.execCommand("insertHTML", false, imageObject);
				} else {
					alert(data.data);
				}
			} else {
				alert(data.data);
			}
		});
	}
}

document.getElementById("toolColor").addEventListener("input", function(e){
	let color = document.getElementById("toolColor").value;
	document.execCommand("foreColor", false, color);
});

document.getElementById("toolSize").addEventListener("change", function(e){
	let size = document.getElementById("toolSize").value;
	document.execCommand("fontSize", false, size);
});

document.querySelector('div[contenteditable="true"]').addEventListener("paste", function(e) {
	e.preventDefault();
	var text = e.clipboardData.getData("text/plain");
	document.execCommand("insertHTML", false, text);
});

