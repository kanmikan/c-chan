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

/* EVENTOS */
$(document).ready(function() {
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