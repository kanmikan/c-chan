/* API DEL LADO DEL CLIENTE DE CCHAN */

/* FUNCIONES */
function openFileSelector(fid){
	document.getElementById(fid).click();
}

function element(eid){
	return document.getElementById(eid);
}

function request(url, callback){
	fetch(url)
	.then(response => response.json())
	.then(data => callback(data));
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

function boxRender(box){
	//render de boxs del lado del cliente.
	let boxThumb = (box.type.includes("video")) ? box.media.preview : box.img.preview;
	
	let bbody = `<a class="box" id="${box.bid}" href="/tema/${box.bid}" style="background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)), url(${boxThumb}); text-decoration: none; background-position: top;"><div class="voxHeader"><div class="tagList"><div class="tag categoryTag"><img src="" style="width: 20px;vertical-align: middle;"><span style="margin-left: 4px;margin-right: 5px;align-self: center;">${box.cat.toUpperCase()}</span></img></div>`;
	
	if (box.type && box.type.includes("video")){
		bbody +=`<div class="tagInvisible ytb"><div class="tagWrapper"></div><i class="fab fa-youtube"></i></div>`;
	}
	if (box.type && box.type.includes("dice")){
		bbody +=`<div class="tagInvisible pollTag"><div class="tagWrapper"></div><i class="fas fa-dice-three"></i></div>`;
	}
	if (box.type && box.type.includes("poll")){
		bbody +=`<div class="tagInvisible pollTag"><div class="tagWrapper"></div><i class="fas fa-poll"></i></div>`;
	}
	if (box.type && box.type.includes("rss")){
		bbody +=`<div class="tagInvisible rss"><div class="tagWrapperTransparent"></div><i class="fas fa-rss"></i></div>`;
	}
	if (box.date && box.date.csticky > 0){
		bbody +=`<div class="tagInvisible csticky"><div class="tagWrapperTransparent"></div><i class="fas fa-thumbtack"></i></div>`;
	}
	if (box.date && box.date.sticky > 0){
		bbody +=`<div class="tag sticky">Sticky</div>`;
	}
	
	bbody +=`</div><div class="voxComments textShadon"><i class="fas fa-comment"></i><span class="countComments">${box.content.comments}</span></div><div class="voxAction textShadon"><div class="actionBotton" data-voxaction="${box.bid}"><i class="fas fa-ellipsis-v" data-voxaction="${box.bid}"></i></div></div></div>`;
	
	if (box.content.extra != undefined && box.content.extra.title2 != undefined){
		bbody +=`<h5 class="animetitle textShadon">${box.content.extra.title2}</h5>`;
	}
	
	bbody +=`<h4 class="title textShadon">${box.content.title}</h4><div class="over"></div><div class="voxActions unselect"><div class="voxActionBotton"><div class="actionText" data-act="hide" data-contentid="${box.bid}">Ocultar</div></div><div class="voxActionBotton"><div class="actionText" data-act="report" data-contentid="${box.bid}">Reportar</div></div><div class="voxActionBotton"><div class="actionText" data-act="close"><i class="fas fa-times"></i></div></div></div></a>`;
	
	$("#boxList").prepend(bbody);
}

function commentRender(op, com){
	//render de comentarios del lado del cliente.			
	let cbody =`<div class="comment" id="${com.cid}"><div class="commentAvatar"><img class="avatar" src="${com.icon}" alt=""></div><div class="commentBody"><div class="commentMetadata"><div class="commentsTag unselect">`;
	if (op){
		cbody += `<span class="commentTag op">OP</span>`;
	}
	if (com.type.includes("idunico")){
		cbody += `<span class="commentIdUnico" style="background-color: #${com.data.idcolor}">${com.data.idu}</span>`;
	} else {
		if (com.user.jerarquia.nick){
			cbody +=`<span class="author">${com.user.jerarquia.nick}</span>`;
		} else {
			cbody +=`<span class="author">Anonimo</span>`;
		}
	}
	if (com.user.jerarquia.rango || com.user.jerarquia.color){
		cbody +=`<span class="commentTag" style="background-color: ${com.user.jerarquia.color}">${com.user.jerarquia.rango}</span>`;
	} else {
		cbody +=`<span class="commentTag">anon</span>`;
	}
	cbody +=`<span class="commentTag pointer" data-tag="${com.cid}" onclick="tag('>>${com.cid}')">${com.cid}</span>`;			
		
	//aca irían los botones de moderacion..
	if (USERDATA && (USERDATA.includes("ADMIN") || USERDATA.includes("GMOD"))){
		cbody +=`<span class="commentTag pointer"><i class="fas fa-exclamation-triangle"></i></span><span class="commentTag pointer"><i class="fas fa-flag"></i></span><span class="commentTag pointer"><i class="fas fa-trash"></i></span>`;
	} else {
		cbody +=`<span class="commentTag pointer"><i class="fas fa-flag"></i></span>`;

	}	
	cbody +=`</div><div class="commentCreatedAt">${timeSince(com.date.created)}</div></div><div class="commentReply">`;
	com.content.extra.tags.forEach(function(tag){
		cbody +=`<a href="#${tag}" class="tag" data-tag="${tag}">>>${tag}</a>`;
	});
	cbody +=`</div><div class="commentData">`;
	if (com.type.includes("image")){
		cbody +=`<figure class="commentAttach"><div style="position: relative;width: 100%;height: 100%;"><i class="fa fa-search-plus attachExpandIcon hidden"></i><a class="voxImage" target="_BLANK" href="${com.img.full}"><img src="${(isGif(com.img.preview)) ? com.img.full : com.img.preview}"></img></a></div></figure>`;
	}
	if (com.type.includes("video")){
		cbody +=`<figure class="commentAttachVideo"><div class="video-container"><iframe src="${com.media.raw}" srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=${com.media.raw}?autoplay=1><img src=${ com.media.preview}><span>▶</span></a>" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></figure>`;
	}
	cbody +=`<div class="commentContent">${com.content.body}<br></div></div></div></div>`;	
	$("#commentList").prepend(cbody);
	//TODO: cambiar todo esto urgente......
	element("voxComments").innerHTML = $("#commentList").children().length-2;
}

function checkBoxFieldLocal(){
	//Este es un simple control de campos local, su funcion es simplemente ahorrarse una request al pedo.
	if (element("bcat").value === ""){
		alert("Elige una categoria valida");
		return false;
	} else if (element("btitle").value === ""){
		alert("Falta un titulo");
		return false;
	} else if ((element("bimg").value === "" && element("bvid").value === "")){
		alert("Añade una imagen o video");
		return false;
	} else {
		return true;
	}
}

function checkComFieldLocal(){
	if (element("cimg").value === "" && element("cvid").value === ""){
		if (element("commentTextarea").value === ""){
			alert("Escribe algo o sube una imagen.");
			return false;
		}
	}
	return true;
}

function tag(cid){
	element("commentTextarea").value += cid + "\n";
}

function hashScroll(hash){
	if (hash != ""){
		window.location.hash = hash;
		let elem = element(hash.substring(1));
		let offset = elem.offsetTop;
		let h = elem.clientHeight - 32;
		let wh = window.innerHeight;
		if (h < wh) {offset = offset - ((wh/2)-(h/2));}
		
		[].forEach.call(document.querySelectorAll(".jump"), function(e) {
			e.classList.remove("jump");
		});
		document.documentElement.scrollTo({top: offset, behavior: 'smooth'});
		elem.classList.add("jump");
	}
}

function checkURLType(url){
	if (url.search("i.imgur.com") != -1){
		return "imgur";
	} else if (url.search("res.cloudinary.com") != -1){
		return "cloudinary";
	} else if (url.search("i3.ytimg.com") != -1) {
		return "youtube-img";
	} else if (url.search("youtube.com/embed") != -1) {
		return "youtube-embed";
	} else if (url.search("youtube.com/watch") != -1){
		return "youtube-url";
	} else {
		return "generic";
	}
}

function isGif(url){
	return url.slice(-4) === ".gif";
}

function isImg(url){
	let match = url.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)
	return (match) ? true : false;
}

function detectMedia(url){
	let type = checkURLType(url);
	if (type === "youtube-embed" || type === "youtube-url"){
		if (type === "youtube-url"){
			//primero convertir a embed
			url = "https://www.youtube.com/embed/" + youtubeParser(url);
		}
		return {video: true, raw: url, thumb: genYoutubeThumb(url, "mq")};
 	} else if (isImg(url)) {
		//es una imagen
		return {video: false, raw: url, thumb: url};
	} else {
		//lo demas esta desactivado.
		return null;
	}
}
	
//FUNCION: obtiene el thumbnail de un video de youtube
function genYoutubeThumb(url, quality){
	var id = youtubeParser(url);
	return (id) ? "https://i3.ytimg.com/vi/" + id + "/" + quality + "default.jpg" : "/assets/logo.png";
}

//FUNCION: obtiene el id del video de youtube
function youtubeParser(url){
	let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	let match = url.match(regExp);
	return (match && match[2].length == 11) ? match[2] : null;
}

function action_newNotification(data){
	//actualizar notificaciones
	/* TODO: cambiar todo esto, es horrible :c */
	$('#notif_icon').load(document.URL + ' #notif_icon>*');
	$('#notificationsList').load(document.URL + ' #notificationsList>*', function (){
		//aca se actualiza el titulo de la web...
	});	
	//popup de la notificacion
	action_openPopup(data);
}

//TODO: javascript nativo.
function action_openPopup(data){
	let img = data.content.preview.thumb;
	let title = data.content.preview.title;
	let cpreview = data.content.preview.desc;
	let msgHtml = "";
	let type = (data.content.tag) ? "Te respondieron en:" : "Comentaron en tu tema:";
	
	msgHtml = `<div class="alert" data-bid="${data.content.bid}" data-cid="${data.content.cid}"><div class="ntfclose">x</div><div class="avatar"><img class="ntfavatar" src="${img}"></div><div class="ntfreport"><span>${type} ${title}</span></br><span>${cpreview}</span></div></div>`;
	
	//10 segundos hasta que remueva el primer elemento en la lista
	$("#alertBox").append(msgHtml);
	setTimeout(function(){
		$("#alertBox").children().first().remove();
	}, 10000);
}

function action_newBoxPopup(data){
	//añadir box al buffer
	B_BUFFER.push(data.data);
	//mostrar cantidad de nuevos temas
	let msg = (B_BUFFER.length > 1) ? `Cargar ${B_BUFFER.length} Temas` : `Cargar 1 Tema`;
	$("#newAlert").html(msg);
	element("newAlert").classList.remove("disabled");
}

function action_newComCupdate(data){
	//actualiza el contador de comentarios.
	let counter = $(`#${data.data.bid}`).find(".countComments");
	counter.html(parseInt(counter.html()) + 1);
}

function action_newComEffect(data){
	let border = $(`#${data.data.bid}`).find(".over");
	let color = ((data.eff) ? data.eff.color : null) || "#00bcd4";
	let trs = ((data.eff) ? data.eff.trs : null) || "1400ms";
	
	//activar y desactivar el efecto del borde.
	border.attr("style", `border-color: ${color} !important;transition: border ${trs} ease-in-out`);
	
	setTimeout(function(){
		border.attr("style", ``);
	}, 1200);
}

/* EVENTOS */
document.addEventListener("DOMContentLoaded", function(e) {
	//hacer scroll al comentario al cargar la pagina.
	//TODO: es necesario cancelar scroll del navegador?
	hashScroll(document.location.hash);
});

$(document).ready(function() {
	
	//evento: click en popup de nuevo tema.
	if (element("newAlert")){
		element("newAlert").addEventListener("click", function(e){
			//cargar nuevos temas AL INICIO DE LA LISTA o actualizar lista.
			B_BUFFER.sort(function(a, b){
				return a.date.bump - b.date.bump;
			});
			B_BUFFER.forEach(function(box){
				box.flag.push("new");
			});
			for (var i=0; i<B_BUFFER.length; i++){
				boxRender(B_BUFFER[i]);
			}
			
			B_BUFFER = [];
			element("newAlert").classList.add("disabled");
		});
	}
	
	//evento: hover de imagenes
	$(document).on("click", ".attachExpandIcon", function (e) {
		e.preventDefault();
		$(e.target).parent().parent().toggleClass("commentAttachExpand");
		let voxImageE = $(e.currentTarget).parent().find(".voxImage");
		let pics = voxImageE.data("pics").split(",");
		
		if ($(e.currentTarget).hasClass("fa-search-plus")){
			$(e.currentTarget).removeClass("fa-search-plus");
			$(e.currentTarget).addClass("fa-search-minus");
			voxImageE.children().attr("src", pics[0]);
		} else {
			$(e.currentTarget).removeClass("fa-search-minus");
			$(e.currentTarget).addClass("fa-search-plus");
			voxImageE.children().attr("src", pics[1]);
		}
	});
	$(document).on("mouseenter", ".commentAttach, .voxAttach", function (e) {
		$(e.currentTarget).find(".attachExpandIcon").removeClass("hidden");
	});
	$(document).on("mouseleave", ".commentAttach, .voxAttach", function (e) {
		$(e.currentTarget).find(".attachExpandIcon").addClass("hidden");
	});
	
	//evento: click en popup de notificacion.
	$(document).on("click", ".alert", function(e){
		e.preventDefault();
		if (!$(e.target).hasClass("ntfclose")){
			let target = $(e.target).parent();
			let popData = (target.data().bid) ? target.data() : target.parent().data();
			location.href = `/api/ntf/${popData.bid}/${popData.cid}`;
		}
	});
	
	$(document).on("click", ".ntfclose", function(e){
		e.preventDefault();
		//quita la notificacion de la lista.
		$(e.target).parent().remove();
	});
	
	//evento: menu de opciones de los boxs
	$(document).on("click",".actionBotton", function(e){
		e.preventDefault();
		let menu = $(this).parent().parent().parent();
		$(menu).addClass("actionMode");
	});
	$(document).on("click",".voxActionBotton", function(e){
		e.preventDefault();
		let action = $(e.target).data("act");
		let buttons = $(this).parent().parent();
		
		//TODO: llamada al server a la ruta /action/id, el server comprueba los privilegios y realiza la accion, de esta manera sería seguro enviar los botones y rutas de moderacion al cliente, porque aunque tengan acceso a esa data, no tendrian manera de explotarlo.
		
		switch(action){
			case "close":
				$(buttons).removeClass("actionMode");
				break;
			case "report":
				console.log("report box");
				$(buttons).removeClass("actionMode");
				break;
			case "hide":
				console.log("hide box");
				$(buttons).removeClass("actionMode");
				break;
		}
	});
	
	//evento: al hacer click en cargar mas comentarios.
	if (element("commentLoadMore")){
		element("commentLoadMore").addEventListener("click", function(e){
			//ordenar array en base al timestamp:
			COMS.sort(function(a, b){
				return a.created - b.created;
			});
			for (var i=0; i<COMS.length; i++){
				commentRender(COMS[i].op, COMS[i].data);
			}
			COMS = [];
			element("commentLoadMore").classList.add("hidden");
		});
	}
	
	//evento: al seleccinar un link en modal de tema
	if (element("blinkButton")){
		element("blinkButton").addEventListener("click", function(e){
			if ($("#burl").hasClass("hidden")){
				element("burl").classList.remove("hidden");
				$("#blinkButton").html('<i class="fas fa-check"></i>');
			} else {
				element("burl").classList.add("hidden");
				$("#blinkButton").html('<i class="fas fa-link"></i>');
				
				var link = $("input[name=burl]").val();
				if (link.trim() != ""){
					element("burl").value = "";
					console.log(link);
					
					let mediaData = detectMedia(link);
					if (mediaData){
						//enviar imagen del thumbnail al form
						if (mediaData.video){
							element("bvid").value = mediaData.raw + ";" + mediaData.thumb;
						} else {
							element("bimg").value = mediaData.raw + ";" + mediaData.thumb;
						}
						//mostrar imagen en el cuadro de preview
						element("nimgpreview").setAttribute("src", mediaData.thumb);
						$("#previewInputVox").attr("style", "display: block !important");
					}
					
				}
			}
		});
	}
	
	//evento: al seleccionar un link en comentarios
	//TODO: convertir a javascript nativo.
	if (element("linkButton")){
		element("linkButton").addEventListener("click", function(e){
			if ($("#curl").hasClass("hidden")){
				//esta oculto, activar
				element("curl").classList.remove("hidden");
				//cambiar icono a palomita
				$("#linkButton").html('<i class="fas fa-check"></i>');
			} else {
				//esta visible, enviar informacion si existe y desactivar.
				element("curl").classList.add("hidden");
				$("#linkButton").html('<i class="fas fa-link"></i>');
				var link = $("input[name=url]").val();
				if (link.trim() != ""){
					element("curl").value = "";
					//analizar y manipular la url
					let mediaData = detectMedia(link);
					if (mediaData){
						//enviar imagen del thumbnail al form
						if (mediaData.video){
							element("cvid").value = mediaData.raw + ";" + mediaData.thumb;
						} else {
							element("cimg").value = mediaData.raw + ";" + mediaData.thumb;
						}
						//mostrar imagen en el cuadro de preview
						element("imgpreview").setAttribute("src", mediaData.thumb);
						element("previewInputComment").classList.remove("hide");
					}
					
				}
			}
		});
		element("closePreview").addEventListener("click", function(e){
			element("previewInputComment").classList.add("hide");
			element("imgpreview").setAttribute("src", "");
		});
	}
	
	//evento: hover sobre un tag
	//TODO: convertir a javascript nativo...
	let quote = $(document).find('#floatQuote');
	$(document).on("mouseenter", ".tag", function (e) {
		var id = "#" + $(document).find(e.target).attr("data-tag");	
		var targetElement = $(document).find(id);
		quote.removeClass("hidden");
		quote.addClass("popupw");
		quote.css({left:  e.pageX - 40, top:   e.pageY - 100});	
		$(document).find('#floatQuote').html(targetElement.html());		
	});
	$(document).on("mouseleave", ".tag", function (e) {
		quote.addClass("hidden");
	});
	
	//evento: comprobar hash al hacer click en una clase tag
	//TODO: lo mismo de arriba.
	$(document).on("click","a",function(event){
		if (this.hash != "") {
			event.preventDefault();
			hashScroll(this.hash);
		}
	});
	
	//evento: post de comentario.
	//TODO: añadir los efectos de la interfaz.
	if (element("newComment")) {
		element("newComment").addEventListener("click", function(e){
			e.preventDefault();
			let form = $("#createComment").serialize();
			
			if (checkComFieldLocal()){
				postForm(form, "/api/com", function(target){
					//accion antes de enviar.
				}, function(result){
					//accion al terminar.
					if (result.success){
						//añadir comentario y limpiar vista.
						resetCommentInputData();
						//commentRender(OP, result.data);
					} else {
						if (result.data.banned){
							//TODO: mostrar mensaje de baneo con toda la info necesaria.
							alert(JSON.stringify(result.data.bandata));
						} else {
							alert(result.data);
						}
					}
				});
			}
		});
	}
	
	//evento: al crear un tema (este evento no es explicitamente necesario, pero sirve para manejo de errores)
	//TODO: añadir los efectos de la interfaz.
	if (element("newVox")) {
		element("newVox").addEventListener("click", function(e){
			e.preventDefault();
			let form = $("#createVox").serialize();
			
			//control de campos local
			if (checkBoxFieldLocal()){
				postForm(form, "/api/new", function(target){	
				}, function(result){
					if (result.success){
						window.location.href = result.data.url;
					} else {
						if (result.data.banned){
							alert(JSON.stringify(result.data.bandata));
						} else {
							alert(result.data);
						}
					}
				});
			}
		});
	}
	
	
	//evento: al seleccinar un archivo en el modal de nuevo tema
	//TODO: añadir los efectos de la interfaz.
	if (element("bfile")){
		element("bfile").addEventListener("change", function(e){
			let file = element("bfile").files.item(0);
			if (file && file.type.split("/")[0] === "image"){
				getDataURL(file, function(target){
					element("nimgpreview").setAttribute("src", target);
					element("btext").classList.add("hidden");
					element("bspin").classList.remove("hidden");
					element("newVox").disabled = true;
				}, function(data){
					if (data.success){
						element("nimgpreview").setAttribute("src", data.data.link);
						$("#previewInputVox").attr("style", "display: block !important");
						let img = data.data.link + ";" + data.data.thumb;
						element("bimg").value = img;
					} else {
						element("nimgpreview").setAttribute("src", "");
						if (data.data.banned){
							alert(JSON.stringify(data.data.bandata));
						} else {
							alert(JSON.stringify(data.data));
						}
					}
					element("btext").classList.remove("hidden");
					element("bspin").classList.add("hidden");
					element("newVox").disabled = false;
				});	
			}
		});
	}
	
	//evento: al seleccionar un archivo en los comentarios.
	//TODO: añadir los efectos de la interfaz.
	if (element("cfile")){
		element("cfile").addEventListener("change", function (e){
			let file = element("cfile").files.item(0);
			//comprobacion rapida de que el archivo sea una imagen.
			if (file && file.type.split("/")[0] === "image"){
				//si es una imagen, subir
				getDataURL(file, function(target){
					element("imgpreview").setAttribute("src", target);
					element("previewInputComment").classList.remove("hide");
					element("loadingCom").classList.remove("hidden");
					element("ctext").classList.add("hidden");
					element("newComment").disabled = true;
				}, function(data){
					if (data.success){
						element("imgpreview").setAttribute("src", data.data.link);
						let img = data.data.link + ";" + data.data.thumb;
						element("cimg").value = img;
					} else {
						element("previewInputComment").classList.add("hide");
						element("imgpreview").setAttribute("src", "");
						if (data.data.banned){
							alert(JSON.stringify(data.data.bandata));
						} else {
							alert(JSON.stringify(data.data));
						}
					}
					
					element("loadingCom").classList.add("hidden");
					element("ctext").classList.remove("hidden");
					element("newComment").disabled = false;
				});	
			}
			
			element("closePreview").addEventListener("click", function(e){
				element("previewInputComment").classList.add("hide");
				element("imgpreview").setAttribute("src", "");
			});
		});
	}
	
});