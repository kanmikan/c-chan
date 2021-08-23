/* API DEL LADO DEL CLIENTE DE CCHAN */

/* FUNCIONES */
function openFileSelector(fid){
	document.getElementById(fid).click();
}

function element(eid){
	return document.getElementById(eid);
}

function getDataURL(file, before, callback) {
	var reader = new FileReader();
	reader.onload = function(event) {		
		var formData = new FormData();
		formData.append("imgData", file);
		post(formData, "/api/upload", 
		function(target){
			before(event.target.result);
		}, 
		function(data){
			callback(data);
		})
	};
	reader.readAsDataURL(file);
}

function post(formdata, url, before, callback){
	$.ajax({
		type: 'POST',
		url: url,
		data: formdata,
		processData: false,
		contentType: false,
		beforeSend: function() {
			before(event.target.result);
		}
	}).done(function(data) {
		callback(data);
	});
}

function postForm(formdata, url, before, callback){
	$.ajax({
		type: 'POST',
		url: url,
		data: formdata,
		beforeSend: function() {
			before(event.target.result);
		}
	}).done(function(data) {
		callback(data);
	});
}

function timeSince(timestamp) {
	var now = new Date(); 
	var secondsPast = (now.getTime() - timestamp) / 1000;
	if (secondsPast < 60) {
		return parseInt(secondsPast) + 's';
	} else if (secondsPast < 3600) {
		return parseInt(secondsPast / 60) + 'm';
	} else if (secondsPast < 86400) {
		return parseInt(secondsPast / 3600) + 'h';
	} else if (secondsPast < 2678400) {
		return parseInt(secondsPast / 86400) + 'd';
	} else if (secondsPast <= 32140800) {
		return parseInt(secondsPast / 2678400) + 'ms';
	} else if (secondsPast > 32140800) {
		return parseInt(secondsPast / 32140800) + 'a';
	}	
}

function resetCommentInputData(){
	element("createComment").dispatchEvent(new Event("reset"));
	element("commentTextarea").value = "";
	element("cimg").value = "";
	element("cvid").value = "";
	
	//cerrar mini vista previa, si es que esta abierta..
	element("previewInputComment").classList.add("hide");
	element("imgpreview").setAttribute("src", "");
	
}

function commentRender(com){
	//render de comentarios del lado del cliente.			
	let cbody =`<div class="comment" id="${com.cid}"><div class="commentAvatar"><img class="avatar" src="${com.icon}" alt=""></div><div class="commentBody"><div class="commentMetadata"><div class="commentsTag unselect">`;
	if (OP){
		cbody += `<span class="commentTag op">OP</span>`;
	}
	if (com.type.includes("idunico")){
		cbody += `<span class="commentIdUnico" style="background-color: #${com.data.idcolor}">${com.data.idu}</span>`;
	} else {
		if (com.user.jerarquia.nick == undefined){
			cbody +=`<span class="author">Anonimo</span>`;
		} else {
			cbody +=`<span class="author">${com.user.jerarquia.nick}</span>`;
		}
	}
	if (com.user.jerarquia.nick == undefined || com.user.jerarquia.jcolor == undefined){
		cbody +=`<span class="commentTag">anon</span>`;
	} else {
		cbody +=`<span class="commentTag" style="background-color: ${com.user.jerarquia.jcolor}">${com.user.jerarquia.autor}</span>`;
	}
	cbody +=`<span class="commentTag pointer" data-tag="${com.cid}" onclick="tag('>>${com.cid}')">${com.cid}</span>`;			
		
	//aca irían los botones de moderacion..
	cbody +=`<span class="commentTag pointer"><i class="fas fa-flag"></i></span>`;
			
	cbody +=`</div><div class="commentCreatedAt">${timeSince(com.date.created)}</div></div><div class="commentReply">`;
	com.content.extra.tags.forEach(function(tag){
		cbody +=`<a href="#${tag}" class="tag" data-tag="${tag}">>>${tag}</a>`;
	});
	cbody +=`</div><div class="commentData">`;
	if (com.type.includes("image")){
		cbody +=`<figure class="commentAttach"><div style="position: relative;width: 100%;height: 100%;"><i class="fa fa-search-plus attachExpandIcon hidden"></i><a class="voxImage" target="_BLANK" href="${com.img.full}"><img src="${com.img.preview}"></img></a></div></figure>`;
	}
	if (com.type.includes("video")){
		cbody +=`<figure class="commentAttachVideo"><div class="video-container"><iframe src="${com.media.raw}" srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=${com.media.raw}?autoplay=1><img src=${ com.media.preview}><span>▶</span></a>" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></figure>`;
	}
	cbody +=`<div class="commentContent">${com.content.body}<br></div></div></div></div>`;	
	$("#commentList").prepend(cbody);
}

/* EVENTOS */
$(document).ready(function() {
	
	//evento: post de comentario.
	element("newComment").addEventListener("click", function(e){
		e.preventDefault();
		let form = $("#createComment").serialize();
		//formdata.append("data", {test: "test"});
		postForm(form, "/api/com", function(target){
			//accion antes de enviar.
		}, function(result){
			//accion al terminar.
			if (result.success){
				//añadir comentario y limpiar vista.
				resetCommentInputData();
				commentRender(result.data);
			}
		});
	});
	
	//evento: al seleccionar un archivo en los comentarios.
	element("cfile").addEventListener("change", function (e){
		let file = element("cfile").files.item(0);
		//comprobacion rapida de que el archivo sea una imagen.
		if (file && file.type.split("/")[0] === "image"){
			//si es una imagen, subir
			let formdata = new FormData();
			formdata.append("imgData", file);
			getDataURL(file, function(target){
				element("imgpreview").setAttribute("src", target);
				element("previewInputComment").classList.remove("hide");
				element("loadingCom").classList.remove("hidden");
			}, function(data){
				if (data.success){
					element("imgpreview").setAttribute("src", data.data.link);
					let img = data.data.link + ";" + data.data.thumb;
					element("cimg").value = img;
				} else {
					element("previewInputComment").classList.add("hide");
					element("imgpreview").setAttribute("src", "");
				}
				
				element("loadingCom").classList.add("hidden");
			});	
		}
		
		element("closePreview").addEventListener("click", function(e){
			element("previewInputComment").classList.add("hide");
			element("imgpreview").setAttribute("src", "");
		});
	});
	
	
	
});