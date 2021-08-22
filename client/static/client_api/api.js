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

function loadingEvent(){
	
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

function resetCommentInputData(){
	element("createComment").dispatchEvent(new Event("reset"));
	element("commentTextarea").value = "";
	//cerrar mini vista previa, si es que esta abierta..
	element("previewInputComment").classList.add("hide");
	element("imgpreview").setAttribute("src", "");
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
				console.log("subiendo...");
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
				console.log(data);
			});	
		}
		
		element("closePreview").addEventListener("click", function(e){
			element("previewInputComment").classList.add("hide");
			element("imgpreview").setAttribute("src", "");
		});
	});
	
	
	
});