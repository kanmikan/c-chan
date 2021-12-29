/* API DEL LADO DEL CLIENTE DE CCHAN */

/* FUNCIONES */
function openFileSelector(fid){
	document.getElementById(fid).click();
}

function element(eid){
	return document.getElementById(eid);
}

function elementClass(ecl){
	return document.querySelectorAll(ecl);
}

function parseHTML(data){
	return new DOMParser().parseFromString(data, "text/html").body.firstChild;
}

function swalert(data, callback){
	Swal.fire(
		data.title,
		data.text,
		data.icon
	).then((result) => {
		callback(result);
	});
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
		formData.append("fileData", file);
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
	before();
	fetch(url, {
		method: "POST",
		headers: {
			"X-CSRF-Token": element("_csrf_token").value
		},
		body: formdata
	}).then(response => response.json())
	.then(data => callback(data));
}

function postForm(formdata, url, before, callback){
	before();
	fetch(url, {
		method: "POST",
		headers: {
			"Content-Type" : "application/x-www-form-urlencoded",
			"X-CSRF-Token": element("_csrf_token").value
		},
		body: formdata
	}).then(response => response.json())
	.then(data => callback(data));
}

function timeSince(timestamp) {
	var now = new Date();
	var secondsPast = (now.getTime() - timestamp) / 1000;
	if (secondsPast < 60) {
		return ((parseInt(secondsPast) < 0) ? 0 : parseInt(secondsPast)) + 's';
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
	if (element("pollc")) {
		element("pollc").value = "0";
		element("pollcOpt1").classList.add("hidden");
		element("pollcOpt2").classList.add("hidden");
	}
	
	//cerrar mini vista previa, si es que esta abierta..
	element("previewInputComment").classList.add("hide");
	element("imgpreview").setAttribute("src", "");	
}

function getCategoryData(catid){
	let default_ = {content: {media: {icon: "/assets/logo.png", image: "/assets/logo.png", misc: []}}};
	if (typeof CATS !== "undefined"){
		let cdata = CATS.filter( item => item.catid === catid)[0];
		return (cdata) ? cdata : default_;
	} else {
		return default_;
	}
}

function getCatShow(categoria){
	//añadir parametros especiales a las categorias, ejemplo: oficial
	if (categoria === "oficial"){return "<span>Oficial</span>";}
	return categoria.toUpperCase();
}

//TODO: cambiar esto por un render intermediario (redirect del api a ejs y retorno del html ya construido)
function boxRender(box){
	//render de boxs del lado del cliente.
	let boxThumb = (box.type.includes("video")) ? box.media.preview : box.img.preview;
	let catdata = getCategoryData(box.cat);
	
	let bbody = `<a class="box" id="${box.bid}" href="/${box.cat}/${box.bid}" style="background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)), url(${boxThumb}); text-decoration: none; background-position: top;"><div class="voxHeader"><div class="tagList"><div class="tag categoryTag">`;
	if (SHOW_CATEGORY_ICON) {
		bbody +=`<img src="${catdata.content.media.icon}"`;			
	}
	bbody += `<span style="margin-left: 4px;margin-right: 5px;align-self: center;">${getCatShow(box.cat)}</span>
	</img></div>`;
	
	if (box.date && box.date.sticky > 0){
		bbody +=`<div class="tag sticky">Sticky</div>`;
	}
	if (box.date && box.date.csticky > 0){
		bbody +=`<div class="tag csticky"><i class="fas fa-thumbtack"></i></div>`;
	}
	if (box.type && box.type.includes("video")){
		bbody +=`<div class="tag ytb"><i class="fas fa-play"></i></div>`;
	}
	if (box.type && box.type.includes("dice")){
		bbody +=`<div class="tag diceTag"><i class="fas fa-dice-three"></i></div>`;
	}
	if (box.type && box.type.includes("poll")){
		bbody +=`<div class="tag pollTag"><i class="fas fa-poll"></i></div>`;
	}
	if (box.type && box.type.includes("idunico")){
		bbody +=`<div class="tag iduTag"><i class="fas fa-id-card"></i></div>`;
	}
	if (box.type && box.flag.includes("rss")){
		bbody +=`<div class="tagInvisible rss"><i class="fas fa-rss"></i></div>`;
	}
	if (box.flag && box.flag.includes("new")){
		bbody +=`<div class="tagInvisible tagNew">Nuevo</div>`;	
	}
	if (box.type && box.flag.includes("sync")){
		bbody +=`<div class="tag sync"><i class="fas fa-sync"></i></div>`;
	}
	
	bbody +=`</div><div class="voxComments textShadon"><i class="fas fa-comment"></i><span class="countComments">${box.content.comments}</span></div><div class="voxAction textShadon"><div class="actionBotton" data-voxaction="${box.bid}"><i class="fas fa-ellipsis-v" data-voxaction="${box.bid}"></i></div></div></div>`;
	
	if (box.content.extra != undefined && box.content.extra.title2 != undefined){
		bbody +=`<h5 class="animetitle textShadon">${box.content.extra.title2}</h5>`;
	}
	
	bbody +=`<h1 class="title textShadon">${box.content.title}</h1><div class="over"></div><div class="voxActions unselect"><div class="voxActionBotton"><div class="actionText" data-act="hide" data-contentid="${box.bid}">Ocultar</div></div><div class="voxActionBotton"><div class="actionText" data-act="report" data-contentid="${box.bid}">Reportar</div></div><div class="voxActionBotton"><div class="actionText" data-act="close"><i class="fas fa-times"></i></div></div></div></a>`;
	
	return bbody;
}

//TODO: cambiar esto por un render intermediario (redirect del api a ejs y retorno del html ya construido)
function activityRender(com){
	let icon = com.icon.split(",");
	let cbody = `<div class="chatlike-box" onclick="location.href='/tema/${com.bid}#${com.cid}'"><div class="chatlike-img">`;
	let iconText = (icon[4]) ? icon[4] : "ANON";
	if (icon[0] === "ico") {
		cbody +=`<div class="anonIcon" style="background: ${icon[1]}; width: 35px; height: 35px"><div class="anonText actAnonText ${icon[5]}" style="color: ${icon[2]};">${iconText}</div></div>`;
	} else if (icon[0] === "class") {
		cbody +=`<div class="anonIcon ${icon[1]}" style="width: 35px; height: 35px"><div class="anonText actAnonText ${icon[2]}">${iconText}</div></div>`;
	} else {
		cbody +=`<img class="avatar" style="width: 35px; height: 35px" src="${com.icon}" alt="">`;
	}
	
	//accesorio test
	cbody +=`<div class="act anonIcon anonAccesory ${icon[3]}"></div>`;
	
	cbody += `</div><div class="chatlike-data">
	<div class="chatlike-title">
		<span class="chatlike-user">${com.user.jerarquia.nick} ha comentado:</span>
	</div>`;
	if (com.type.includes("image")){
		cbody += `<img class="chatlike-image" src="${com.img.preview}"></img></br>`;
	} else if (com.type.includes("video")){
		//TODO: icono de video etc..
		cbody += `<img class="chatlike-image" src="${com.media.preview}"></img></br>`;
	}
	
	let textcontent = com.content.body;
	if (textcontent.length > 150){
		textcontent = textcontent.substr(0, 150) + "...";
	}
	cbody += `<div class="chatlike-text">${textcontent}</div>
	</div></div>`;
	
	return cbody;
}

//TODO: cambiar esto por un render intermediario (redirect del api a ejs y retorno del html ya construido)
function iconRender(iconData, acc=true, act=false){
	let icon = iconData.split(",");
	let iconText = (icon[4]) ? icon[4] : "ANON";
	let ibody = ``;
	let textmode = (act) ? "actAnonText" : "";
	
	if (icon[0] === "ico") {
		ibody +=`<div class="anonIcon" style="background: ${icon[1]}"><div class="anonText ${textmode} ${icon[5]}" style="color: ${icon[2]}">${iconText}</div></div>`;
	} else if (icon[0] === "class") {
		ibody +=`<div class="anonIcon ${icon[1]}"><div class="anonText ${textmode} ${icon[2]}">${iconText}</div></div>`;
	} else {
		ibody +=`<img class="avatar" src="${com.icon}" alt="">`;
	}
	if (acc){
		ibody +=`<div class="anonIcon anonAccesory ${icon[3]}"></div>`;
	}
	return ibody;
}

//TODO: cambiar esto por un render intermediario (redirect del api a ejs y retorno del html ya construido)
function commentRender(op, com){
	//render de comentarios del lado del cliente.			
	let cbody =`<div class="comment" id="${com.cid}"><div class="commentAvatar unselect">`;
	
	cbody += iconRender(com.icon);
	
	cbody +=`</div><div class="commentBody"><div class="commentMetadata"><div class="commentsTag unselect">`;
	if (op){
		cbody += `<span class="commentTag op">OP</span>`;
	}
	if (com.type.includes("idunico")){
		cbody += `<span class="commentIdUnico" style="background-color: ${com.content.extra.idunico.color}">${com.content.extra.idunico.id}</span>`;
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
		
	cbody +=`<span class="commentTag pointer actionFlag" data-cid="${com.cid}"><i class="fas fa-flag"></i></span>`;
	
	if (USERDATA && (USERDATA.includes("ADMIN") || USERDATA.includes("GMOD") || USERDATA.includes("MOD"))){
		cbody +=`<span class="commentTag pointer actionMod"><i class="fas fa-ellipsis-v" style="padding: 0px 3px;"></i></span>
		<div class="commentTag actionModContainer hidden">
		<span class="pointer actionModComOption" data-cid="${com.cid}" data-action="com_adv"><i class="fas fa-exclamation-triangle"></i>
		<span> Advertir</span></span>
		<span class="pointer actionModComOption" data-cid="${com.cid}" data-action="com_ban"><i class="fas fa-eye-slash"></i>
		<span> Banear</span></span>
		<span class="pointer actionModComOption" data-cid="${com.cid}" data-action="com_delete"><i class="fas fa-trash"></i>
		<span> Borrar</span></span></div>`;
	}
	
	cbody +=`</div><div class="commentCreatedAt">${timeSince(com.date.created)}</div></div><div class="commentReply">`;
	com.content.extra.tags.forEach(function(tag){
		cbody +=`<a href="#${tag}" class="tag" data-tag="${tag}">&gt;&gt;${tag}</a>`;
	});
	cbody +=`</div>`;
	//render de encuestas del lado del cliente
	if (com.type.includes("poll")){
		let poll = com.content.extra.poll;
		cbody +=`<div class="commentPoll">`;
		if (poll && poll.voted){
			cbody +=`<div class="option">${poll.optionText}</div>`;
		}
		cbody +=`</div>`;
	}
	
	cbody +=`<div class="commentData">`;
	if (com.type.includes("image")){
		cbody +=`<figure class="commentAttach"><div style="position: relative;width: 100%;height: 100%;"><i class="fa fa-search-plus attachExpandIcon hidden"></i><a class="voxImage" data-pics="${com.img.full}|${com.img.preview}" target="_BLANK" href="${com.img.full}"><img src="${(isGif(com.img.preview)) ? com.img.full : com.img.preview}"></img></a></div></figure>`;
	}
	if (com.type.includes("video")){
		cbody +=`<figure class="commentAttachVideo"><div class="video-container"><iframe src="${com.media.raw}" srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=${com.media.raw}?autoplay=1><img src=${ com.media.preview}><span>▶</span></a>" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></figure>`;
	}
	cbody +=`<div class="commentContent">${com.content.body}<br></div></div></div></div>`;	
	$("#commentList").prepend(cbody);
	
	//actualizar lista de comentarios.
	element("voxComments").innerHTML = $("#commentList").children().length;
}

function checkBoxFieldLocal(){
	//Este es un simple control de campos local, su funcion es simplemente ahorrarse una request al pedo.
	if (element("bcat").value === ""){
		swalert({title: "Error", text: "Elige una categoria valida", icon: "error"}, function(){});
		return false;
	} else if (element("btitle").value === ""){
		swalert({title: "Error", text: "Falta un titulo", icon: "error"}, function(){});
		return false;
	} else if ((element("bimg").value === "" && element("bvid").value === "")){
		swalert({title: "Error", text: "Añade una imagen o video", icon: "error"}, function(){});
		return false;
	} else {
		return true;
	}
}

function checkComFieldLocal(){
	if (element("cimg").value === "" && element("cvid").value === ""){
		if (element("commentTextarea").value === ""){
			swalert({title: "Error", text: "Escribe algo o sube una imagen", icon: "error"}, function(){});
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
		window.history.replaceState(null, null, hash);
		
		let elem = element(hash.substring(1));
		let offset = elem.offsetTop;
		let h = elem.clientHeight - 32;
		let wh = window.innerHeight;
		if (h < wh) {offset = offset - ((wh/2)-(h/2));}
		
		[].forEach.call(document.querySelectorAll(".jump"), function(e) {e.classList.remove("jump");});

		window.scrollTo({top: offset, behavior: 'smooth'});
		elem.classList.add("jump");
	}
}

function showHomebarScroll(){
	element("homeBar").style["overflow-y"] = "scroll";
}

function isGif(url){
	return url.slice(-4) === ".gif";
}

function isImg(url){
	let match = url.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)
	return (match) ? true : false;
}

//FUNCION copypaste: obtiene la media de altura del documento en la vista.
function getDocumentHeight() {
    return Math.max(
        Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
        Math.max(document.body.clientHeight, document.documentElement.clientHeight)
    );
}

function getCategory(){
	let category = KIND.split("/")[1];
	
	if (category === "tema"){
		return KIND.split("/")[2];
	} else {
		return (category === "") ? "home" : category;
	}
}

function action_loadLastActivity(){
	request(`/api/categorycoms/${getCategory()}/8`, function(result){
		if (result.success){
			result.data.slice(0, 8).forEach(function(com){
				let actRender = activityRender(com);
				
				if (element("activityList")) element("activityList").append(parseHTML(actRender));
				element("movilActivityList").append(parseHTML(actRender));
			});
		}
	});
}

//TODO: limitar a un maximo de elementos.
function action_appendActivity(data){
	let actRender = activityRender(data);
	
	if (element("activityList")) element("activityList").prepend(parseHTML(actRender));
	element("movilActivityList").prepend(parseHTML(actRender));
}

//TODO: javascript nativo
function action_newNotification(data){
	//actualizar contador.
	$("#notif_icon").load(document.URL + " #notif_icon>*", function(){
		let notifCount = parseInt(element("menuIconCount").textContent);
		action_titleAppendCounter(notifCount);
	});
	
	//cargar la nueva lista de notificaciones
	$("#notificationsList").load(document.URL + " #notificationsList>*");	
	
	//popup de la notificacion
	action_openPopup(data);
}

function action_titleAppendCounter(count){
	let d = document.createElement('div');
	d.innerHTML = document.title;
	document.title = d.innerText;
	if (count > 0) {
		let oldTitle = document.title;
		let oldTitleRef = /^\(/s.test(oldTitle);
		if (oldTitleRef){
			oldTitle = oldTitle.substr(4);
		}
		document.title = `(${count}) ${oldTitle}`;
	}
}

function action_openPopup(data){
	let img = data.content.preview.thumb;
	let title = data.content.preview.title;
	let cpreview = data.content.preview.desc;
	if (cpreview.length > 150) {
		cpreview = cpreview.substr(0, 150) + "...";
	}
	
	let type = (data.content.tag) ? "Te respondieron en:" : "Comentaron en tu tema:";
	type = (data.type.includes("alert")) ? "" : type;
	
	let msgHtml = `<div class="alert" data-bid="${data.content.bid}" data-cid="${data.content.cid}"><div class="ntfclose">x</div><div class="avatar"><img class="ntfavatar" src="${img}"></div><div class="ntfreport"><span>${type} ${title}</span></br><span>${cpreview}</span></div></div>`;
	
	element("alertBox").append(parseHTML(msgHtml));
	//10 segundos hasta que remueva el primer elemento en la lista
	setTimeout(function(){
		element("alertBox").removeChild(element("alertBox").children[0]);
	}, 10000);
}

//TODO: javascript nativo
function action_newBoxPopup(data){
	//añadir box al buffer
	B_BUFFER.push(data.data);
	//mostrar cantidad de nuevos temas
	let msg = (B_BUFFER.length > 1) ? `Cargar ${B_BUFFER.length} temas nuevos` : `Cargar 1 tema nuevo`;
	$("#newAlert").html(msg);
	element("newAlert").classList.remove("disabled");
}

//TODO: javascript nativo
function action_newComCupdate(data){
	//actualiza el contador de comentarios.
	let counter = $(`#${data.data.bid}`).find(".countComments");
	counter.html(parseInt(counter.html()) + 1);
}

//TODO: javascript nativo
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

function action_updateBoxList(indexID, callback){
	request(`/api/box/${indexID}/${getCategory()}`, function(result){
		callback(result);
	});
}

function action_pollUpdate(data){
	let pollData = data.pollData;
	element("pollOne").children[1].innerText = pollData[0];
	element("pollTwo").children[1].innerText = pollData[1];
}

//FUNCION: envia la configuracion al server
function applyConfig(query){
	let formData = new FormData();
	//ejemplo opcion:valor
	//opcion_add:valor = añadir elemento a lista
	//opcion_del:valor = eliminar elemento de lista
	//opcion:valor = actualizar elemento
	formData.append("data", query);
	post(formData, "/api/config", function(){}, function(result){
		if (!result.success){
			(result.data.redirect) ? action_login(result.data) : swalert({title: "Error", text: result.data, icon: "error"}, function(){});
		}
	});
}

//FUNCION: maneja el drop/paste de elementos en el cuadro de creacion de temas.
//TODO: reducir codigo duplicado.
function action_boxDrop(e){
	e.preventDefault();
	e.stopPropagation();
	let dataTransfer = e.originalEvent.dataTransfer;
	let dataFile = (dataTransfer) ? dataTransfer.files[0] : null;
	
	if (dataFile && dataFile.type.split("/")[0] === "image"){
		//es un archivo de imagen, subir
		getDataURL(dataFile, function(target){
			$("#previewInputVox").attr("style", "display: block !important");
			element("nimgpreview").setAttribute("src", target);
			effect_newboxLoading(0);
		}, function(data){
			effect_newboxLoading(1);
			if (data.success){
				element("nimgpreview").setAttribute("src", data.data.thumb);
				element("bimg").value = data.data.link + ";" + data.data.thumb;
			} else {
				element("nimgpreview").setAttribute("src", "");
				//alert(JSON.stringify(data.data));
				swalert({title: "Error", text: data.data, icon: "error"}, function(){});
			}
		});
	} else {
		//viene de otra pagina
		let dataHtml = (dataTransfer) ? dataTransfer.getData("text/html") : null;
		if (!dataHtml) {dataHtml = e.originalEvent.clipboardData.getData("text/html");}
		let context = $('<div>').append(dataHtml);
		let imgURL = $(context).find("img").attr("src");
		
		//subir imagen.
		let formData = new FormData();
		formData.append("link", imgURL);
		post(formData, "/api/uplink", function(){
			$("#previewInputVox").attr("style", "display: block !important");
			element("nimgpreview").setAttribute("src", imgURL);
			effect_newboxLoading(0);
		}, function(data){
			effect_newboxLoading(1);
			if (data.success){
				element("nimgpreview").setAttribute("src", data.data.thumb);
				element("bimg").value = data.data.raw + ";" + data.data.thumb;
			} else {
				element("nimgpreview").setAttribute("src", "");
				//alert(JSON.stringify(data.data));
				swalert({title: "Error", text: data.data, icon: "error"}, function(){});
			}
		});	
	}
}

//FUNCION: manejo del evento de drop y paste en los comentarios.
//TODO: reducir codigo duplicado.
function action_commentDrop(e){
	e.preventDefault();
	e.stopPropagation();
	let dataTransfer = e.originalEvent.dataTransfer;
	let dataFile = (dataTransfer) ? dataTransfer.files[0] : null;
	
	if (dataFile && dataFile.type.split("/")[0] === "image"){
		//es un archivo de imagen, subir
		getDataURL(dataFile, function(target){
			element("imgpreview").setAttribute("src", target);
			element("previewInputComment").classList.remove("hide");
			effect_newComLoading(0);
		}, function(data){
			effect_newComLoading(1);
			if (data.success){
				element("imgpreview").setAttribute("src", data.data.thumb);
				element("cimg").value = data.data.link + ";" + data.data.thumb;
			} else {
				element("previewInputComment").classList.add("hide");
				element("imgpreview").setAttribute("src", "");
				//alert(JSON.stringify(data.data));
				swalert({title: "Error", text: data.data, icon: "error"}, function(){});
			}
		});
	}
}

//enviar reporte.
function action_flag(data){
	let formData = new FormData();
	formData.append("kind", data.kind);
	
	switch (data.kind){
		case "comment":
			formData.append("cid", data.cid);
			formData.append("razon", data.razon);
			break;
		case "box":
			formData.append("bid", data.bid);
			formData.append("razon", data.razon);
			break;
	}
	
	post(formData, "/api/report", function(){}, function(data){
		if (data.success){
			swalert({title: "Hecho", text: data.data, icon: "success"}, function(){});
		} else {
			swalert({title: "Error", text: data.data, icon: "error"}, function(){});
		}
	});
}

function isMobileDevice() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

function action_login(data){
	//$("#idForm").css("display", "block");
	element("idForm").style["display"] = "block";
}

function effect_newComLoading(state){
	switch(state){
		case 0:
			element("loadingCom").classList.remove("hidden");
			element("ctext").classList.add("hidden");
			element("newComment").disabled = true;
		break;
		case 1:
			element("loadingCom").classList.add("hidden");
			element("ctext").classList.remove("hidden");
			element("newComment").disabled = false;
		break;
	}
}

function effect_newboxLoading(state){
	switch(state){
		case 0:
			element("btext").classList.add("hidden");
			element("bspin").classList.remove("hidden");
			element("newVox").disabled = true;
		break;
		case 1:
			element("btext").classList.remove("hidden");
			element("bspin").classList.add("hidden");
			element("newVox").disabled = false;
		break;
	}
}

/* EVENTOS */
$(document).ready(function() {
	
	//hacer scroll al comentario al cargar la pagina.
	hashScroll(document.location.hash);
	//evento generico: al hacer scroll
	let timer;
	$(document.body).on("touchmove", onScroll);
	$(window).on("scroll", onScrollDesktop);
	let complete = true;
	
	//anti hover para evitar lag
	function onScrollDesktop(){
		if (!isMobileDevice()){
			if (!document.body.classList.contains("disable-hover")){
				document.body.classList.add("disable-hover");
			}
		}
		onScroll();
	}
	window.addEventListener("mousemove", function(e){
		if (document.body.classList.contains("disable-hover")){
			document.body.classList.remove("disable-hover");
		}
	});	
	
	function onScroll(){
		//evento: calcula si debe mostrar el boton de ir arriba o no
		if ($("#commentList").children().length > 10){
			if ($(window).scrollTop() > Math.round($(document).height() * 20 / 100)) {
				$('#attach-goup').removeClass("hidden");
			} else {
				$('#attach-goup').addClass("hidden");
			}
		}
		
		//evento: al llegar al final
		if ($(window).height() + $(window).scrollTop() > (getDocumentHeight() - 100)){
			if (!complete) return;
			if (KIND.split("/")[1] === "tema") return;
			
			complete = false;
			let indexID = $("#boxList").children().last().attr("id");
			$("#moreload").removeClass("hidden");
			action_updateBoxList(indexID, function(data){
				if (data.success){
					let lboxs = data.data;
					for (var i=0; i<lboxs.length; i++){
						$("#boxList").append(boxRender(lboxs[i]));
						complete = true;
					}
				}
				$("#moreload").addClass("hidden");
			});
			
		}
		
	}
	
	//evento: accion de creacion de id
	//TODO: limpiar codigo duplicado.
	if (element("idButton")){
		element("idButton").addEventListener("click", function(e){
			e.preventDefault();
			let userid = element("userid").value;
			let formdata = new FormData();
			
			formdata.append("userid", userid);
			post(formdata, "/api/idlogin", function(){
				element("idloadingLogin").classList.remove("hidden");
				element("idText").classList.add("hidden");
			}, function(result){
				element("idloadingLogin").classList.add("hidden");
				element("idText").classList.remove("hidden");
				if (result.success){
					element("idForm").style["display"] = "none";
				} else {
					swalert({title: "Error", text: result.data, icon: "error"}, function(){});
				}
			});
			
		});
		element("idClose").addEventListener("click", function(e){
			element("idForm").style["display"] = "none";
		});
	}
		
	//evento: votar encuesta
	//TODO: javascript nativo
	$(document).on("click", ".pollOption", function(e){
		let option = $(e.currentTarget).data("poll");
		let bid = $(e.currentTarget).parent().data("bid");
		
		let formData = new FormData();
		formData.append("vote", option);
		formData.append("bid", bid);
		
		post(formData, "/api/poll", function(){
			element("pollOne").classList.add("pollLoading");
			element("pollTwo").classList.add("pollLoading");
		}, function(result){
			if (result.success){
				//actualizar opcion seleccionada.
				switch(result.data.option){
					case "1":
						element("pollOne").classList.add("voted");
					break;
					case "2":
						element("pollTwo").classList.add("voted");
					break;
				}
				//activar señal de voto
				element("pollc").value = "1";
				element("pollcOpt" + result.data.option).classList.remove("hidden");
				action_pollUpdate(result.data);
			} else {
				(result.data.redirect) ? action_login(result.data) : swalert({title: "Error", text: result.data, icon: "error"}, function(){});
			}
			element("pollOne").classList.remove("pollLoading");
			element("pollTwo").classList.remove("pollLoading");
		});
		
	});
	
	if (element("toolsButton")){
		element("toolsButton").addEventListener("click", function(e){
			element("toolsList").classList.toggle("hidden");
		});
	}
	
	$(document).on("click", ".commentBoxPollClose", function(e){
		e.preventDefault();
		e.stopPropagation();
		element("pollc").value = "0";
		element("pollcOpt1").classList.add("hidden");
		element("pollcOpt2").classList.add("hidden");
	});
	
	$(document).on("click", ".toolButton", function(e){
		let target = $(e.currentTarget);
		switch (target.data().tool){
			case "tag":
				element("commentTextarea").value += ">";
				break;
			case "colortag":
				element("commentTextarea").value += "$FF0texto$";
				break;
			
		}
	});
	
	if (element("changeSesion")){
		element("changeSesion").addEventListener("click", function(e){
			action_login();
		});
	}
	
	//evento: al realizar busqueda
	if (element("searchInput")){
		element("searchInput").addEventListener("keypress", function(e){
			if (e.key === "Enter"){
				let query = element("searchInput").value;
				if (query.trim() != ""){
					element("searchInput").value = "";
					element("searchButton").click();
					location.href = `/search/${query}`;	
				}
			}
		});
	}
	
	//evento: click en favorito en box
	if (element("iconfav")){
		element("iconfav").addEventListener("click", function(e){
			let bid = $(e.target).parent().data().bid;
			if ($(e.target).parent().hasClass("faved")){
				$(e.target).parent().removeClass("faved");
				applyConfig("favs_del:" + bid);
			} else {
				$(e.target).parent().addClass("faved");
				applyConfig("favs_add:" + bid);
			}
		});
	}
	
	//evento: click en ocultar en box.
	if (element("iconhide")){
		element("iconhide").addEventListener("click", function(e){
			let bid = $(e.target).parent().data().bid;
			if ($(e.target).parent().hasClass("hided")){
				$(e.target).parent().removeClass("hided");
				applyConfig("boxhides_del:" + bid);
			} else {
				$(e.target).parent().addClass("hided");
				applyConfig("boxhides_add:" + bid);
			}
		});
	}
	
	//eventos: opciones en los temas.
	if (element("option-godown")){
		element("option-godown").addEventListener("click", function(e){
			document.documentElement.scrollTo({top: document.documentElement.scrollHeight, behavior: 'smooth'});
		});
	}
	if (element("attach-goup")){
		element("attach-goup").addEventListener("click", function(e){
			var fistElementPosition = $(".commentList").position().top - 150;
			document.documentElement.scrollTo({top: fistElementPosition, behavior: 'smooth'});
		});
	}
	if (element("option-imglist")){
		element("option-imglist").addEventListener("click", function(e){
			if (element("attachList").classList.contains("hidden")){
				element("attachList").classList.remove("hidden");
				element("commentList").classList.add("hidden");
				element("commentsTitle").innerText = "Archivos";
				element("voxComments").innerText = element("attachList").childElementCount;
			} else {
				element("attachList").classList.add("hidden");
				element("commentList").classList.remove("hidden");
				element("commentsTitle").innerText = "Comentarios";
				element("voxComments").innerText = element("commentList").childElementCount;
			}
		});
	}
	if (element("option-autoload")){
		element("option-autoload").addEventListener("click", function(e){
			//Lloran los gordos anti operadores ternarios kjj
			AUTOLOAD_COMMENTS = (AUTOLOAD_COMMENTS) ? false : true;
			(AUTOLOAD_COMMENTS)? element("option-autoload").classList.add("hided") : element("option-autoload").classList.remove("hided");
		});
	}
	
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
				//ordenar temas sticky
				$("#boxList").prepend(boxRender(B_BUFFER[i]))
				.children().sort(function(a, b){
					let obj1 = (($(a).find(".tag.sticky").length > 0) || (KIND != "/" && ($(a).find(".csticky").length > 0)));
					let obj2 = (($(b).find(".tag.sticky").length > 0) || (KIND != "/" && ($(b).find(".csticky").length > 0)));
					return obj2 - obj1;
				}).appendTo("#boxList");
			}
			
			B_BUFFER = [];
			element("newAlert").classList.add("disabled");
		});
	}
	
	//evento: al mover un archivo a los comentarios
	$("#createComment").on("drop", function(e) {
		action_commentDrop(e);
	});
	
	//evento: al pegar una imagen
	//TODO: limpiar codigo repetido.
	$("#commentTextarea").on("paste", function(e) {
		//solo leer imagenes e ignorar texto o links.
		let actionPaste = e.originalEvent.clipboardData.getData("text/html");
		let context = $('<div>').append(actionPaste);
		let imgURL = $(context).find("img").attr("src");
		if (imgURL){
			//subir imagen.
			let formData = new FormData();
			formData.append("link", imgURL);
			post(formData, "/api/uplink", function(){
				element("imgpreview").setAttribute("src", imgURL);
				element("previewInputComment").classList.remove("hide");
				element("loadingCom").classList.remove("hidden");
				element("ctext").classList.add("hidden");
				element("newComment").disabled = true;
			}, function(data){
				element("loadingCom").classList.add("hidden");
				element("ctext").classList.remove("hidden");
				element("newComment").disabled = false;
				if (data.success){
					element("imgpreview").setAttribute("src", data.data.thumb);
					element("cimg").value = data.data.raw + ";" + data.data.thumb;
				} else {
					element("previewInputComment").classList.add("hide");
					element("imgpreview").setAttribute("src", "");
					//alert(JSON.stringify(data.data));
					swalert({title: "Error", text: data.data, icon: "error"}, function(){});
				}
			});
		}
	});
	
	//evento: al mover un archivo al cuadro de creacion de tema.
	$("#previewInputVox").on("dragover", function(event) {
		event.preventDefault();  
		event.stopPropagation();
	});
	$("#previewInputVox").on("dragleave", function(event) {
		event.preventDefault();  
		event.stopPropagation();
	});
	$("#previewInputVox").on("drop", function(e) {
		action_boxDrop(e);
	});
	
	//evento: al hacer click en menu de categoria.
	$(document).on("click", ".home-menu", function(e){
		e.preventDefault();
		let catkind = $(e.target).parent().data();
		let menuElement = $(e.target).parent().children().last();
		menuElement.toggleClass("hidden");
	});
	
	//evento: al hacer click en el titulo de la categoria
	$(document).on("click", ".home-category-title", function (e) {
		let blist = $(e.target).parent().children().last();
		if (blist.hasClass("home-category-boxlist")){
			blist.toggleClass("hidden");
		}
	});
	
	$(document).on("click", ".home-menu-dropdown-element", function (e) {
		let kind = $(e.currentTarget).parent().parent().parent().data("id");
		let action = $(e.currentTarget).data("action");
		let spanElement = $(e.currentTarget).find(".home-menu-dropdown-element-text");
		
		switch(action){
			case "pinear":
				applyConfig("anchors_add:" + kind);
				$(e.currentTarget).data("action", "despinear");
				$("#boxList").load(document.URL +  ' #boxList>*');
				break;
			case "ocultar":
				applyConfig("cathides_add:" + kind);
				$(`#${kind}`).addClass("hidden");
				break;
			case "despinear":
				applyConfig("anchors_del:" + kind);
				$(e.currentTarget).data("action", "pinear");
				$("#boxList").load(document.URL +  ' #boxList>*');
				break;
		}
		$(e.currentTarget).parent().parent().addClass("hidden");
	});
	
	//evento: hover de imagenes
	$(document).on("click", ".attachExpandIcon", function (e){
		e.preventDefault();
		$(e.target).parent().parent().toggleClass("commentAttachExpand");
		let voxImageE = $(e.currentTarget).parent().find(".voxImage");
		let pics = voxImageE.data("pics").split("|");
		
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
		let contentId = $(e.target).data("contentid");
		let buttons = $(this).parent().parent();
		switch(action){
			case "close":
				$(buttons).removeClass("actionMode");
				break;
			case "report":
				console.log("report box");
				//console.log(contentId);
				
				Swal.fire({
					title: "Denunciar comentario",
					text: "Motivo de la denuncia:",
					input: 'text',
					showCancelButton: true,
					confirmButtonText: 'Denunciar',
					cancelButtonText: 'Cancelar'
				}).then((result) => {
					if (result.value) {
						action_flag({kind: "box", bid: contentId, razon: result.value});
					}
					$(buttons).removeClass("actionMode");
				});
				
				break;
			case "hide":
				applyConfig("boxhides_add:" + contentId);
				$(`#${contentId}`).hide();
				$(buttons).removeClass("actionMode");
				break;
			case "unhide":
				applyConfig("boxhides_del:" + contentId);
				$(`#${contentId}`).hide();
				$(buttons).removeClass("actionMode");
				break;
		}
	});
	
	//evento: al denunciar un comentario.
	$(document).on("click", ".actionFlag", function(e){
		let cid = $(e.currentTarget).data("cid");
		
		Swal.fire({
			title: "Denunciar comentario",
			text: "Motivo de la denuncia:",
			input: 'text',
			showCancelButton: true,
			confirmButtonText: 'Denunciar',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.value) {
				action_flag({kind: "comment", cid: cid, razon: result.value});
			}
		});
		
	});
	
	//evento: al denunciar un tema.
	$(document).on("click", "#iconDenuncia", function(e){
		let bid = $(e.currentTarget).data("bid");
		
		Swal.fire({
			title: "Denunciar tema",
			text: "Motivo de la denuncia:",
			input: 'text',
			showCancelButton: true,
			confirmButtonText: 'Denunciar',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.value) {
				action_flag({kind: "box", bid: bid, razon: result.value});
			}
		});
		
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
					//analizar y manipular la url
					let formData = new FormData();
					formData.append("link", link);
					post(formData, "/api/uplink", function(target){
						//en el momento del envio.
						if (isImg(link)){
							element("nimgpreview").setAttribute("src", link);
						}
						element("btext").classList.add("hidden");
						element("bspin").classList.remove("hidden");
						element("newVox").disabled = true;
					}, function(data){
						//respuesta.
						if (data.success){
							let mediaData = data.data;
							if (mediaData.video){
								element("bvid").value = mediaData.raw + ";" + mediaData.thumb;
								//mostrar opcion de sincronizacion
								element("vidsync").classList.remove("hidden");
							} else {
								element("bimg").value = mediaData.raw + ";" + mediaData.thumb;
							}
							//mostrar imagen en el cuadro de preview
							element("nimgpreview").setAttribute("src", mediaData.thumb);
							$("#previewInputVox").attr("style", "display: block !important");
						} else {
							element("nimgpreview").setAttribute("src", "");
							//(data.data && data.data.banned) ? alert(JSON.stringify(data.data.bandata)) : ((data.data && data.data.redirect) ? action_login(data.data) : alert (JSON.stringify(data.data)));
							
							if (data.data && data.data.banned) {
								swalert({title: "Has sido baneado", text: data.data.bandata.razon, icon: "error"}, function(){});
							} else {
								(data.data && data.data.redirect) ? action_login(data.data) : swalert({title: "Error", text: data.data, icon: "error"}, function(){});
							}
							
						}
						element("btext").classList.remove("hidden");
						element("bspin").classList.add("hidden");
						element("newVox").disabled = false;
					});
					
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
					let formData = new FormData();
					formData.append("link", link);
					post(formData, "/api/uplink", function(target){
						//en el momento del envio.
						if (isImg(link)){
							element("imgpreview").setAttribute("src", link);
							element("previewInputComment").classList.remove("hide");
						}
						element("loadingCom").classList.remove("hidden");
						element("ctext").classList.add("hidden");
						element("newComment").disabled = true;
					}, function(data){
						//respuesta.
						if (data.success){
							let mediaData = data.data;
							if (mediaData.video){
								element("cvid").value = mediaData.raw + ";" + mediaData.thumb;
							} else {
								element("cimg").value = mediaData.raw + ";" + mediaData.thumb;
							}
							//mostrar imagen en el cuadro de preview
							element("imgpreview").setAttribute("src", mediaData.thumb);
							element("previewInputComment").classList.remove("hide");
						} else {
							//(data.data && data.data.banned) ? alert(JSON.stringify(data.data.bandata)) : ((data.data && data.data.redirect) ? action_login(data.data) : alert (JSON.stringify(data.data)));
							
							if (data.data && data.data.banned) {
								swalert({title: "Has sido baneado", text: data.data.bandata.razon, icon: "error"}, function(){});
							} else {
								(data.data && data.data.redirect) ? action_login(data.data) : swalert({title: "Error", text: data.data, icon: "error"}, function(){});
							}
							
						}
						element("loadingCom").classList.add("hidden");
						element("ctext").classList.remove("hidden");
						element("newComment").disabled = false;
					});
					
				}
			}
		});
		element("closePreview").addEventListener("click", function(e){
			element("cvid").value = "";
			element("cimg").value = "";
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
		let obj = targetElement.find("img")[0];
		if (obj){
			LazyLoad.load(obj);
		}
		$(document).find('#floatQuote').html(targetElement.html());
	});
	$(document).on("mouseleave", ".tag", function (e) {
		quote.addClass("hidden");
	});
	
	//evento: comprobar hash al hacer click en una clase tag
	//TODO: lo mismo de arriba.
	$(document).on("click","a", function(event){
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
					element("loadingCom").classList.remove("hidden");
					element("ctext").classList.add("hidden");
					element("newComment").disabled = true;
				}, function(result){
					element("loadingCom").classList.add("hidden");
					element("ctext").classList.remove("hidden");
					element("newComment").disabled = false;
					//accion al terminar.
					if (result.success){
						//añadir comentario y limpiar vista.
						resetCommentInputData();
						if (ASYNC_COMMENTS){commentRender(OP, result.data)}
					} else {
						if (result.data.banned){
							//TODO: mostrar mensaje de baneo con toda la info necesaria.
							//alert(JSON.stringify(result.data.bandata));
							swalert({title: "Has sido baneado", text: result.data.bandata.razon, icon: "error"}, function(){});
						} else {
							(result.data.redirect) ? action_login(result.data) : swalert({title: "Error", text: result.data, icon: "error"}, function(){});
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
					//animacion de carga.
					element("btext").classList.add("hidden");
					element("bspin").classList.remove("hidden");
					element("newVox").disabled = true;
				}, function(result){
					element("btext").classList.remove("hidden");
					element("bspin").classList.add("hidden");
					element("newVox").disabled = false;
					if (result.success){
						window.location.href = result.data.url;
					} else {
						element("newVox").disabled = false;
						if (result.data.banned){
							//alert(JSON.stringify(result.data.bandata));
							swalert({title: "Has sido baneado", text: result.data.bandata.razon, icon: "error"}, function(){});
						} else {
							(result.data.redirect) ? action_login(result.data) : swalert({title: "Error", text: result.data, icon: "error"}, function(){});
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
					$("#previewInputVox").attr("style", "display: block !important");
					element("nimgpreview").setAttribute("src", target);
					element("btext").classList.add("hidden");
					element("bspin").classList.remove("hidden");
					element("newVox").disabled = true;
				}, function(data){
					if (data.success){
						element("nimgpreview").setAttribute("src", data.data.thumb);
						let img = data.data.link + ";" + data.data.thumb;
						element("bimg").value = img;
					} else {
						element("nimgpreview").setAttribute("src", "");
						//(data.data && data.data.banned) ? alert(JSON.stringify(data.data.bandata)) : ((data.data && data.data.redirect) ? action_login(data.data) : alert (data.data));
						
						if (data.data && data.data.banned) {
								swalert({title: "Has sido baneado", text: data.data.bandata.razon, icon: "error"}, function(){});
						} else {
							(data.data && data.data.redirect) ? action_login(data.data) : swalert({title: "Error", text: data.data, icon: "error"}, function(){});
						}
						
					}
					element("btext").classList.remove("hidden");
					element("bspin").classList.add("hidden");
					element("newVox").disabled = false;
				});	
			} else if (file.type.split("/"[0] === "video")) {
				getDataURL(file, function(){
					//element("nimgpreview").setAttribute("src", target);
					element("btext").classList.add("hidden");
					element("bspin").classList.remove("hidden");
					element("newVox").disabled = true;
				}, function(data){
					if (data.success){
						element("nimgpreview").setAttribute("src", data.data.thumb);
						$("#previewInputVox").attr("style", "display: block !important");
						let vid = data.data.link + ";" + data.data.thumb;
						element("bvid").value = vid;
					} else {
						element("nimgpreview").setAttribute("src", "");
						//(data.data && data.data.banned) ? alert(JSON.stringify(data.data.bandata)) : ((data.data && data.data.redirect) ? action_login(data.data) : alert (data.data));
						
						if (data.data && data.data.banned) {
							swalert({title: "Has sido baneado", text: data.data.bandata.razon, icon: "error"}, function(){});
						} else {
							(data.data && data.data.redirect) ? action_login(data.data) : swalert({title: "Error", text: data.data, icon: "error"}, function(){});
						}
						
					}
					element("btext").classList.remove("hidden");
					element("bspin").classList.add("hidden");
					element("newVox").disabled = false;
				});
			} else {
				alert("formato no admitido.");
			}
		});
	}
	
	//evento: al seleccionar un archivo en los comentarios.
	//TODO: añadir los efectos de la interfaz.
	//TODO: limpiar codigo repetido.
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
						element("imgpreview").setAttribute("src", data.data.thumb);
						let img = data.data.link + ";" + data.data.thumb;
						element("cimg").value = img;
					} else {
						element("previewInputComment").classList.add("hide");
						element("imgpreview").setAttribute("src", "");
						//(data.data.banned) ? alert(JSON.stringify(data.data.bandata)) : ((data.data.redirect) ? action_login(data.data) : alert (data.data));
						
						if (data.data && data.data.banned) {
							swalert({title: "Has sido baneado", text: data.data.bandata.razon, icon: "error"}, function(){});
						} else {
							(data.data && data.data.redirect) ? action_login(data.data) : swalert({title: "Error", text: data.data, icon: "error"}, function(){});
						}
						
					}
					
					element("loadingCom").classList.add("hidden");
					element("ctext").classList.remove("hidden");
					element("newComment").disabled = false;
				});	
			} else if (file.type.split("/")[0] === "video"){
				//subir video.
				getDataURL(file, function(){
					element("loadingCom").classList.remove("hidden");
					element("ctext").classList.add("hidden");
					element("newComment").disabled = true;
				}, function(data){
					if (data.success){
						element("previewInputComment").classList.remove("hide");
						element("imgpreview").setAttribute("src", data.data.thumb);
						let vid = data.data.link + ";" + data.data.thumb;
						element("cvid").value = vid;
					} else {
						element("previewInputComment").classList.add("hide");
						element("imgpreview").setAttribute("src", "");
						//(data.data.banned) ? alert(JSON.stringify(data.data.bandata)) : ((data.data.redirect) ? action_login(data.data) : alert (data.data));
						
						if (data.data && data.data.banned) {
							swalert({title: "Has sido baneado", text: data.data.bandata.razon, icon: "error"}, function(){});
						} else {
							(data.data && data.data.redirect) ? action_login(data.data) : swalert({title: "Error", text: data.data, icon: "error"}, function(){});
						}
						
					}
					element("loadingCom").classList.add("hidden");
					element("ctext").classList.remove("hidden");
					element("newComment").disabled = false;
				});
			} else {
				//alert("Formato no admitido");
				swalert({title: "Error", text: "Formato no admitido", icon: "error"}, function(){});
			}
			
			element("closePreview").addEventListener("click", function(e){
				element("loadingCom").classList.add("hidden");
				element("ctext").classList.remove("hidden");
				element("newComment").disabled = false;
				element("previewInputComment").classList.add("hide");
				element("imgpreview").setAttribute("src", "");
			});
		});
	}
	
});