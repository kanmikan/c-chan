/* FUNCIONES */
function element(id){
	return document.getElementById(id);
}

function parseHTML(data){
	return new DOMParser().parseFromString(data, "text/html").body.firstChild;
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

function openFileSelector(fid){
	document.getElementById(fid).click();
}

function isGif(url){
	return url.slice(-4) === ".gif";
}

function isImg(url){
	let match = url.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i)
	return (match) ? true : false;
}

function post(formdata, url, before, callback){
	$.ajax({
		type: 'POST',
		url: url,
		headers: {
			"X-CSRF-Token": element("_csrf_token").value
		},
		data: formdata,
		processData: false,
		contentType: false,
		beforeSend: function() {
			before();
		}
	}).done(function(data) {
		callback(data);
	}).fail(function(xhr, status, error){
		if (status === "error"){
			callback({success: false, data: "error"});
		}
	});
}

function postForm(formdata, url, before, callback){
	$.ajax({
		type: 'POST',
		url: url,
		headers: {
			"X-CSRF-Token": element("_csrf_token").value
		},
		data: formdata,
		beforeSend: function() {
			before();
		}
	}).done(function(data) {
		callback(data);
	}).fail(function(xhr, status, error){
		if (status === "error"){
			callback({success: false, data: "error"});
		}
	});
}

function timeSince(timestamp, mode=0) {
    var now = new Date();
    var secondsPast = (now.getTime() - timestamp) / 1000;

    if (secondsPast < 60) {
        return parseInt(secondsPast) + ((mode === 0) ? 's' : ' segundos');
    } else if (secondsPast < 3600) {
        return parseInt(secondsPast / 60) + ((mode === 0) ? 'm' : ' minuto' + ((parseInt(secondsPast / 60) != 1) ? "s" : ""));
    } else if (secondsPast < 86400) {
        return parseInt(secondsPast / 3600) + ((mode === 0) ? 'h' : ' hora' + ((parseInt(secondsPast / 3600) != 1) ? "s" : ""));
    } else if (secondsPast < 2678400) {
        return parseInt(secondsPast / 86400) + ((mode === 0) ? 'd' : ' dia' + ((parseInt(secondsPast / 86400) != 1) ? "s" : ""));
    } else if (secondsPast <= 32140800) {
        return parseInt(secondsPast / 2678400) + ((mode === 0) ? 'ms' : ' mes' + ((parseInt(secondsPast / 2678400) != 1) ? "es" : ""));
    } else if (secondsPast > 32140800) {
        return parseInt(secondsPast / 32140800) + ((mode === 0) ? 'a' : ' año' + ((parseInt(secondsPast / 32140800) != 1) ? "s" : ""));
    }
}

function tag(cid){
	element("commentTextarea").value += cid + "\n";
	element("commentForm").classList.remove("hidden");
	element("attach-comment").classList.remove("hidden");
	
	//resaltar el comentario taggeado
	[].forEach.call(document.querySelectorAll(".jump"), function(e) {e.classList.remove("jump");});
	element(cid.substr(2)).classList.add("jump");
}

function hashScroll(hash){
	if (hash != "" && element(hash.substring(1))){
		$(document).find("#floatQuote").addClass("hidden");
		window.history.replaceState(null, null, hash);
		let elem = element(hash.substring(1));
		let offset = elem.offsetTop;
		let h = elem.clientHeight - 32;
		let wh = window.innerHeight;
		if (h < wh) {offset = offset - ((wh/2)-(h/2));}
		
		[].forEach.call(document.querySelectorAll(".jump"), function(e) {e.classList.remove("jump");});
		
		//window.scrollTo({top: offset, behavior: 'smooth'});
		window.scrollTo({top: offset});
		
		elem.classList.add("jump");
	}
}

//filtrar comentarios temporales de la lista
function clearTempComments(){
	[].forEach.call(document.querySelectorAll(".jump"), function(e) {e.classList.remove("jump");});
	let metaversionlist = $("#commentList").find(".metaversion");
	for (var v=0; v<metaversionlist.length; v++){
		if ($(metaversionlist[v]).data("version") === "temp"){
			$(metaversionlist[v]).parent().parent().parent().remove()
		}
	}
}


let COMMENT_INPUT_BACKUP = {};
function resetCommentInputData(){
	element("attach-comment").classList.add("hidden");
	
	COMMENT_INPUT_BACKUP = {};
	COMMENT_INPUT_BACKUP["commentTextarea"] = element("commentTextarea").value;
	COMMENT_INPUT_BACKUP["cimg"] = element("cimg").value;
	COMMENT_INPUT_BACKUP["cvid"] = element("cvid").value;
	
	element("commentForm").dispatchEvent(new Event("reset"));
	element("commentTextarea").value = "";
	element("cimg").value = "";
	element("cvid").value = "";
	
	if (element("pollc")) {
		COMMENT_INPUT_BACKUP["pollc"] = element("pollc").value;
		if (!element("pollcOpt1").classList.contains("hidden")){
			COMMENT_INPUT_BACKUP["selectedPoll"] = 1;
		} else if (!element("pollcOpt2").classList.contains("hidden")){
			COMMENT_INPUT_BACKUP["selectedPoll"] = 2;
		}
		element("pollc").value = "0";
		element("pollcOpt1").classList.add("hidden");
		element("pollcOpt2").classList.add("hidden");
	}
	
	element("commentAttachPreview").classList.add("hidden");
	element("attachImage").setAttribute("src", "");	
}

function restoreCommentInputData(){
	console.log(COMMENT_INPUT_BACKUP);
	
	element("commentTextarea").value = COMMENT_INPUT_BACKUP["commentTextarea"];
	element("cimg").value = COMMENT_INPUT_BACKUP["cimg"];
	element("cvid").value = COMMENT_INPUT_BACKUP["cvid"];
	
	if (element("pollc")){
		element("pollc").value = COMMENT_INPUT_BACKUP["pollc"];
		if (COMMENT_INPUT_BACKUP["selectedPoll"] === 1){
			element("pollcOpt1").classList.remove("hidden");
		} else if (COMMENT_INPUT_BACKUP["selectedPoll"] === 2) {
			element("pollcOpt2").classList.remove("hidden");
		}
	}
	
	if (COMMENT_INPUT_BACKUP["cimg"] != "" || COMMENT_INPUT_BACKUP["cvid"] != ""){
		element("commentAttachPreview").classList.remove("hidden");
		element("attachImage").setAttribute("src", COMMENT_INPUT_BACKUP["cimg"].split(";")[1]);
	}
	
}

function manageLogin(data){
	element("idLogin").classList.remove("hidden");
}

function boxRender(box){
	let ibody = `<li id="${box.bid}"><a class="post" href="/${box.cat}/${box.bid}" 
	style="background: url(${(box.type.includes("video")) ? box.media.preview : box.img.preview}) center, url(/assets/placeholder.png); background-size: cover;">
	<div class="icons">`;
	if (box.type.includes("image")) { 
		ibody += `<img alt="image type" class="imgIcon" src="/assets/uicons/image.svg"></img>`;
	}
	if (box.type.includes("video")) {
		ibody += `<img alt="video type" class="videoIcon" src="/assets/uicons/film.svg"></img>`;
	}
	if (box.flag.includes("sync")) {
		ibody += `<img alt="video sync type" class="postIcon postIconSync" src="/assets/uicons/refresh-cw.svg"></img>`;
	}
	if (box.type.includes("post")) {
		ibody += `<img alt="post type" class="postIcon" src="/assets/uicons/file-text.svg"></img>`;
	}
	if (box.type.includes("poll")) {
		ibody += `<img alt="poll type" class="postIcon" src="/assets/uicons/bar-chart-2.svg"></img>`;
	}
	if (box.type.includes("idunico")) {
		ibody += `<img alt="idunico type" class="postIcon" src="/assets/uicons/user.svg"></img>`;
	}
	if (box.date.sticky > 0) {
		ibody += `<img alt="sticky type" class="sticky" src="/assets/uicons/bookmark.svg" style="filter: invert(0.5) sepia(1) hue-rotate(21deg) saturate(30);"></img>`;
	}
	if (box.date.csticky > 0) {
		ibody += `<img alt="csticky type" class="csticky" src="/assets/uicons/paperclip.svg"></img>`;
	}
	
	let bodypreview = box.content.body.replace(/<\/?[^>]+(>|$)/g, " ");
	if (bodypreview.length > 50){
		bodypreview = bodypreview.substr(0, 50) + "...";
	}
	
	//TODO: filtrar el contenido html de bodypreview y title para que no se renderize.
	ibody += `</div>
	<div class="data">
		<h1 class="title">${box.content.title}</h1>
		<h1 class="info txtpreview">${bodypreview}</h1>
		<h1 class="info">${box.content.comments} Comentarios - Hace ${timeSince(box.date.created, 1)}</h1>
	</div></a></li>`;
	return ibody;
}

function avatarRender(com, act=false){
	let ibody = "";
	let icon = com.icon.split(",");
	let activity = (act) ? "activityIcon" : "";
	if (icon[0] === "ico") {
		ibody +=`<div class="anonIcon ${activity}" style="background: ${icon[1]}">`;
		ibody +=`<div class="anonText ${icon[5]} ${activity}" style="color: ${icon[2]}">${(icon[4]) ? icon[4] : "ANON"}</div>`;
	
		ibody +=`</div>`;
	} else if (icon[0] === "class") {
		ibody +=`<div class="anonIcon ${activity} ${icon[1]}">`;
		ibody +=`<div class="anonText ${icon[2]} ${activity}">${(icon[4]) ? icon[4] : "ANON"}</div>`;

		ibody +=`</div>`;
	} else {
		ibody += `<img class="avatar ${activity}" src="${com.icon}" alt="">`;
	}
	ibody += `<div class="anonIcon ${activity} anonAccesory ${(act) ? "activityAccesory" : ""} ${icon[3]}"></div></div>`;
	return ibody;
}

function commentRender(op, com){
	let cbody =`<li class="comment" id="${com.cid}">
	<div class="commentAvatar unselect">`;
	
	cbody += avatarRender(com);
	
	cbody += `<div class="commentBody">
		<div class="commentMetadata">
		<div class="metaversion hidden" data-version="${com.version}"></div>
		<div class="metadataInfo">`;
	if (op) {
		cbody += `<div class="metaElement op">OP</div>`;
	}
	if (com.type.includes("idunico")){
		cbody += `<span class="metaElement idunico" style="background-color: ${com.content.extra.idunico.color}">${com.content.extra.idunico.id}</span>`;
	} else {
		if (com.user.jerarquia.nick){
			cbody +=`<div class="metaElement nick">${com.user.jerarquia.nick}</div>`;
		} else {
			cbody +=`<div class="metaElement nick">Anonimo</div>`;
		}
	}

	if (com.user.jerarquia.rango || com.user.jerarquia.color){
		cbody +=`<div class="metaElement" style="background-color: ${com.user.jerarquia.color}">${com.user.jerarquia.rango}</div>`;
	} else {
		cbody +=`<div class="metaElement">anon</div>`;
	}
	
	cbody += `<div class="metaElement cid pointer" onclick="tag('&gt;&gt;${com.cid}')">${com.cid}</div>`;	
	cbody += `</div><div class="commentRightButtons"><div class="metaElement dateComment">${timeSince(com.date.created)}</div>
	
	<div class="metaElement ficon pointer actionMod"><i class="fas fa-ellipsis-v" style="padding: 0px 3px;"></i>
	
	<div class="nanodropdown hidden">
		<ul class="nanodropdown-content">
			<li class="nanodropdown-item actionModComOption" data-cid="${com.cid}" data-action="com_flag">
				<i class="fas fa-flag"></i>
				<span> Denunciar</span>
			</li>`;
						
	if (USERDATA && (USERDATA.includes("ADMIN") || USERDATA.includes("GMOD") || USERDATA.includes("MOD"))){
		cbody += `
		<li class="nanodropdown-item actionModComOption" data-cid="${com.cid}" data-action="com_adv">
			<i class="fas fa-exclamation-triangle"></i>
			<span> Advertir</span>
		</li>
		<li class="nanodropdown-item actionModComOption" data-cid="${com.cid}" data-action="com_ban">
			<i class="fas fa-eye-slash"></i>
			<span> Banear</span>
		</li>
		<li class="nanodropdown-item actionModComOption" data-cid="${com.cid}" data-action="com_delete">
			<i class="fas fa-trash"></i>
			<span> Borrar</span>
		</li>`;
	}
	
	cbody += `</ul></div></div> </div></div><div class="metadataTagList">`;
	com.content.extra.tags.forEach(function(tag){
		cbody += `<a class="metaTag tag" href="#${tag}" data-tag="${tag}">&gt;&gt;${tag}</a>`;
	});
	
	cbody += `</div>`;
	
	if (com.type.includes("poll")) { 
		let poll = com.content.extra.poll;
		cbody += `<div class="pollOption commentBoxPoll">`;
		if (poll && poll.voted) {
			cbody +=`<div class="pollOptionText">${poll.optionText}</div>`;
		}
		cbody += `</div>`;
	}
	
	cbody += `<div class="commentContent">`;
	if (com.type.includes("image")) {
		cbody += `<figure class="commentMedia media" data-img="${com.img.preview};${com.img.full}"><img src="${com.img.preview}"></img></figure>`;
	} else if (com.type.includes("video")){
		cbody += `<figure class="commentMedia commentVideo expand"><iframe width="100%" height="100%" src="${com.media.raw}" srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}</style><a href=${com.media.raw}?autoplay=1><img src=${com.media.preview}><span>▶</span></a>" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></figure>`;
	}
	cbody += `<div class="contentBody">${com.content.body}</div></div></div>`;
	
	$("#commentList").prepend(cbody);
	
	//actualizar lista de comentarios.
	element("commentCounter").innerHTML = element("commentList").querySelectorAll(".comment").length;
	if (element("noCommentsBox")){
		element("noCommentsBox").classList.add("hidden");
	}
}

function actRender(com){
	let cbody = `<li class="comment activity" onclick="window.location.href='/tema/${com.bid}#${com.cid}'">
	<div class="commentAvatar">`;
	
	cbody += avatarRender(com, true);
	
	cbody += `</div><div>
	<div class="activityTitle">${com.user.jerarquia.nick} ha comentado:</div>`;
	if (com.type.includes("image")) {
		cbody +=`<div class="commentMedia"><img src="${com.img.preview}"></img></div>`;
	} else if (com.type.includes("video")){
		cbody +=`<div class="commentMedia actMediaExpand"><img src="${com.media.preview}"></img></div>`;
	}					
	
	cbody +=`<div>${com.content.body}</div>
	</div></li>`;
		
	return cbody;
}

function deparam(query) {
    var pairs, i, keyValuePair, key, value, map = {};
    if (query.slice(0, 1) === '?') {
        query = query.slice(1);
    }
    if (query !== '') {
        pairs = query.split('&');
        for (i = 0; i < pairs.length; i += 1) {
            keyValuePair = pairs[i].split('=');
            key = decodeURIComponent(keyValuePair[0]);
            value = (keyValuePair.length > 1) ? decodeURIComponent(keyValuePair[1]) : undefined;
            map[key] = value;
        }
    }
    return map;
}

/* EFECTOS */
function action_instantRender(form){
	let data = deparam(form);

	//esquema de un comentario temporal.
	let tempScheme = {
		version: "temp",
		cid: "CARGANDO",
		bid: data.bid,
		user: {
			uid: "uid",
			jerarquia: {
				nick: "Anonimo",
				rango: "anon",
				color: ""
			}
		},
		type: [],
		flag: [],
		date: {
			created: Date.now()
		},
		icon: "ico,#00000080,#00000080, , , ",
		img: {
			preview: "",
			full: "",
			raw: ""
		},
		media: {
			preview: "",
			raw: ""
		},
		content: {
			body: "",
			extra: {
				tags: [],
				idunico: {},
				poll: {}
			}
		}
	}
	
	//parser del texto local
	tempScheme.content.body = commandsParser(data.content);
	//detectar multimedia
	if (data.img != "" && data.vid === ""){
		let image = data.img.split(";");
		tempScheme.type.push("image");
		tempScheme.img.full = image[0];
		tempScheme.img.preview = image[1];
	}
	
	if (data.vid != "" && data.img === ""){
		let video = data.vid.split(";");
		tempScheme.type.push("video");
		tempScheme.media.raw = video[0];
		tempScheme.media.preview = video[1];
	}
	
	//render del comentario temporal
	commentRender(false, tempScheme);
}

//detecta los comandos y en general, todo el codigo html del comentario
function commandsParser(rawtext){
	let patterns = [
		/(<(.*?)>|<(.*?)(\r\n|\r|\n)+)/g, //sanitizado simple
		/::{1}([^\r\n\s]+)/gi, //link interno
		/>>{1}([^\r\n\s]{7})/gi, //tags
		/>(([https?|ftp]+:\/\/)([^\s/?\.#]+\.?)+(\/[^\s]*)?)/gi, //link externo
		/^(>(?!\>).+)/gim, //greentext
		/\$([0-9A-Fa-f]{3})([^]*?)\$/g, //deteccion de color rgb
		/\n/g //salto de linea.
	];
	let pattern_replace = [
		'', //evitar que los kakersitos se domen solos
		'<a href="$1" class="link">&gt;$1</a>',
		'<a href="#$1" class="tag" data-tag="$1">&gt;&gt;$1</a>',
		'<a href="$1" target="_blank" class="link">&gt;$1</a>',
		'<span class="greentext">$1</span>',
		'<span style="color: #$1;text-shadow: 1px 1px black;">$2</span>',
		'<br>'
	];
	
	let output = rawtext;
	for (let i =0; i < patterns.length; i++) {
		output = output.replace(patterns[i], pattern_replace[i]);
	}
	return output;
}

function action_newComEffect(data){
	element(data.data.bid).firstElementChild.classList.add("signal");
	setTimeout(function(){
		element(data.data.bid).firstElementChild.classList.remove("signal");
	}, 1300);
}

function action_newComCupdate(data){
	
}

function action_pollUpdate(data){
	let pollData = data.pollData;
	$("#pollOne").css("width", pollData[0]);
	$("#pollOne > .pollPercent").text(pollData[0]);
	
	$("#pollTwo").css("width", pollData[1]);
	$("#pollTwo > .pollPercent").text(pollData[1]);
	
}

function action_newBoxPopup(data){
	console.log(data);
	B_BUFFER.push(data.data);
	if (element("newPostAlert")){
		element("newPostAlert").innerHTML = (B_BUFFER.length > 1) ? `Cargar ${B_BUFFER.length} Temas` : `Cargar 1 Tema`;
		element("newPostAlertContainer").classList.remove("hidden");
		
		//listener del click y carga de nuevos temas.
		element("newPostAlert").addEventListener("click", function(e){
			B_BUFFER.sort(function(a, b){
				return a.date.bump - b.date.bump;
			});
			B_BUFFER.forEach(function(box){
				box.flag.push("new");
			});
			
			for (var i=0; i<B_BUFFER.length; i++){
				//ordenar temas sticky
				$("#mainContents").prepend(boxRender(B_BUFFER[i]))
				.children().sort(function(a, b){
					let obj1 = (($(a).find(".sticky").length > 0) || (KIND != "/" && ($(a).find(".csticky").length > 0)));
					let obj2 = (($(b).find(".sticky").length > 0) || (KIND != "/" && ($(b).find(".csticky").length > 0)));
					return obj2 - obj1;
				}).appendTo("#mainContents");
			}
			
			B_BUFFER = [];
			element("newPostAlertContainer").classList.add("hidden");
		});
		
	}
}

function action_loadLastActivity(){
	let kind = KIND.split("/")[1];
	if (["/", "/favoritos","/ocultos", "/propios"].includes(KIND)){
		kind = "home";
	}
	if (kind === "tema"){
		kind = KIND.split("/")[2];
	}
	//llamar a la api
	request(`/api/categorycoms/${kind}/10`, function(data){
		//renderizar comentarios
		if (data.data && data.data.length > 0){
			let BUFFER = [];
			if (data.data[0]){
				data.data.forEach(function(com){
					BUFFER.push(actRender(com));
				});
				//incrustar en la lista "activityList"
				$("#activityList").append(BUFFER);
				$("#activityListMobile").append(BUFFER);
			}
		} else {
			let noItem = `<div class="comment sideTitle">No hay actividad</div>`;
			$("#activityList").append(noItem);
			$("#activityListMobile").append(noItem);
		}
	});
}

//TODO: limitar maximo de la lista de actividad.
function action_appendActivity(data){
	let activityElementRender = actRender(data);
	$("#activityList").prepend(activityElementRender);
	$("#activityListMobile").prepend(activityElementRender);
}

function action_newNotification(data){
	$("#notifButton").load(document.URL + " #notifButton>*", function(){
		let count = parseInt($("#notifCount").text());
		action_titleAppendCounter(count);
	});
	$("#notifMenu").load(document.URL + " #notifMenu>*");
	
	action_openPopup(data);
}

function action_titleAppendCounter(count){
	let d = document.createElement('div');
	d.innerHTML = document.title;
	document.title = d.innerText;
	let oldTitle = document.title;
	let oldTitleRef = /^\(/s.test(oldTitle);
	if (oldTitleRef){
		oldTitle = oldTitle.substr(4);
	}
	if (count > 0) {
		document.title = `(${count}) ${oldTitle}`;
	} else {
		document.title = `${oldTitle}`;
	}
}

function action_openPopup(data){
	let img = data.content.preview.thumb;
	let title = data.content.preview.title;
	let cpreview = data.content.preview.desc;
	if (cpreview.length > 250) {
		cpreview = cpreview.substr(0, 250) + "...";
	}
	
	let type = (data.content.tag) ? "Te taggearon en:" : "Comentaron en:";
	type = (data.type.includes("alert")) ? "" : type;
	
	let msgHtml = `<div class="alert" data-bid="${data.content.bid}" data-cid="${data.content.cid}"><div class="ntfclose">x</div><div class="commentAvatar"><img class="anonIcon" src="${img}"></div>
	<div class="ntfreport">
	<span class="ntfreport-title">${type} "${title}"</span>
	</br>
	<span class="ntfreport-body">${cpreview}</span>
	</div></div>`;
	
	element("alertBox").append(parseHTML(msgHtml));
	//10 segundos hasta que remueva el primer elemento en la lista
	setTimeout(function(){
		element("alertBox").removeChild(element("alertBox").children[0]);
	}, 10000);
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
		if (result.data.redirect){
			manageLogin(result.data);
		} else if (!result.success){
			alert(result.data);
		}
	});
}

function isMobileDevice() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

/* EVENTOS */
$(document).ready(function() {
	//hacer scroll al comentario al cargar la pagina.
	hashScroll(document.location.hash);

	//anti hover para evitar lag
	$(window).on("scroll", function(){
		//evento: calcula si debe mostrar el boton de ir arriba o no
		if ($("#commentList").children().length > 10){
			if ($(window).scrollTop() > Math.round($(document).height() * 20 / 100)) {
				$('#attach-goup').removeClass("hidden");
			} else {
				$('#attach-goup').addClass("hidden");
			}
		}
		if (!isMobileDevice() && (KIND && KIND.split("/")[1] != "tema")){
			if (!document.body.classList.contains("disable-hover")){
				document.body.classList.add("disable-hover");
			}
		}
	});
	window.addEventListener("mousemove", function(e){
		if (document.body.classList.contains("disable-hover")){
			document.body.classList.remove("disable-hover");
		}
	});
	
	//evento: cancelar visualizacion de voto en comentarios.
	$(document).on("click", ".commentBoxPollClose", function(e){
		e.preventDefault();
		e.stopPropagation();
		element("pollc").value = "0";
		element("pollcOpt1").classList.add("hidden");
		element("pollcOpt2").classList.add("hidden");
	});
	
	//evento: click en popup de notificacion.
	$(document).on("click", ".alert", function(e){
		e.preventDefault();
		if (!$(e.target).hasClass("ntfclose")){
			let popData = $(e.currentTarget).data();
			location.href = `/api/ntf/${popData.bid}/${popData.cid}`;
		}
	});
	$(document).on("click", ".ntfclose", function(e){
		e.preventDefault();
		//quita la notificacion de la lista.
		$(e.target).parent().remove();
	});
	
	//evento: al hacer click en cargar mas comentarios.
	if (element("commentLoadMore")){
		element("commentLoadMore").addEventListener("click", function(e){
			clearTempComments();
			
			//ordenar array en base al timestamp:
			COMS.sort(function(a, b){
				return a.created - b.created;
			});
			for (var i=0; i<COMS.length; i++){
				commentRender(COMS[i].op, COMS[i].data);
				//renderizar tags nuevos
				//detectar taggueos dentro del comentario.
				checkNewTags(COMS[i].op, COMS[i].data.cid, COMS[i].data.content.body);
			}
			COMS = [];
			element("commentLoadMore").classList.add("hidden");
		});
	}
	
	function checkNewTags(op, lcom, raw){
		let tags = $(parseHTML(raw)).parent().find(".tag");
		let tagnum = tags.length;
		
		for (var i=0; i<tagnum; i++){
			let tag = $(tags[i]).data("tag");
			element(tag).querySelector(".metadataTagList").append(parseHTML(`<a href="#${lcom}" class="tag" data-tag="${lcom}">&gt;&gt;${lcom} ${(op) ? "(OP)" : ""}</a>`));
		}
	}
	
	//evento: hover sobre un tag
	//TODO: convertir a javascript nativo...
	let quote = $(document).find("#floatQuote");
	$(document).on("mouseenter", ".tag", function (e) {
		var id = "#" + $(document).find(e.target).attr("data-tag");	
		var targetElement = $(document).find(id);
		quote.removeClass("hidden");
		quote.addClass("popupw");
		quote.css({left: e.pageX - 40, top: e.pageY - 100});
		let obj = targetElement.find("img")[0];
		if (obj){
			LazyLoad.load(obj);
		}
		$(document).find("#floatQuote").html(targetElement.html());
	});
	$(document).on("mouseleave", ".tag", function (e) {
		quote.addClass("hidden");
	});

	//evento: comprobar hash al hacer click en una clase tag
	//TODO: lo mismo de arriba.
	$(document).on("click","a", function(e){
		if (this.hash != "") {
			e.preventDefault();
			hashScroll(this.hash);
		}
	});

	//observer de la lista de posts
	if (element("list-end")){
		let options = {
			root: null,
			rootMargin: '10px',
			threshold: 1.0
		}
		let observer = new IntersectionObserver(function(entries, observer){
			entries.forEach(function(entry){
				if (entry.isIntersecting){
					//quitar el list-end
					let indexID = $("#mainContents").children().last().attr("id");
					let kind = (KIND === "/") ? "home" : KIND.split("/")[1];
					
					//añadir mas temas
					element("loadMoreContainer").classList.remove("hidden");
					request(`/api/box/${indexID}/${kind}`, function(data){
						element("loadMoreContainer").classList.add("hidden");
						if (data.success){
							let BBUFFER = [];
							data.data.forEach(function(box){
								BBUFFER.push(boxRender(box));
							});
							$("#mainContents").append(BBUFFER);
						}
					});
				}
			});
		}, options);
		observer.observe(element("list-end"));
	}

	//elegir archivo en comentario
	if (element("cfile")){
		element("cfile").addEventListener("change", function(e){
			let file = element("cfile").files.item(0);
			
			getDataURL(file, function(target){
				element("attachImage").setAttribute("src", target);
				element("commentAttachPreview").classList.remove("hidden");
				element("sendComIcon").classList.remove("hidden");
				element("commentButtonText").classList.add("hidden");
			}, function(data){
				element("sendComIcon").classList.add("hidden");
				element("commentButtonText").classList.remove("hidden");
				if (data.success){
					element("cimg").value = data.data.link + ";" + data.data.thumb;
					element("attachImage").setAttribute("src", data.data.thumb);
					element("commentAttachPreview").classList.remove("hidden");
				} else if (data.data.redirect) {
					manageLogin(data.data);
					element("attachImage").setAttribute("src", "");
					element("commentAttachPreview").classList.add("hidden");
				} else {
					alert(data.data);
					element("attachImage").setAttribute("src", "");
					element("commentAttachPreview").classList.add("hidden");
				}
			});
		});
	}
	
		//evento: al mover un archivo a los comentarios
	$("#commentForm").on("drop", function(e) {
		action_commentDrop(e);
	});
	
	function action_commentDrop(e){
		e.preventDefault();
		e.stopPropagation();
		let dataTransfer = e.originalEvent.dataTransfer;
		let dataFile = (dataTransfer) ? dataTransfer.files[0] : null;
		if (dataFile && dataFile.type.split("/")[0] === "image"){
			//es un archivo de imagen, subir
			getDataURL(dataFile, function(target){
				element("attachImage").setAttribute("src", target);
				element("commentAttachPreview").classList.remove("hidden");
				element("sendLText").classList.add("hidden");
				element("sendLIcon").classList.remove("hidden");
			}, function(data){
				element("sendLText").classList.remove("hidden");
				element("sendLIcon").classList.add("hidden");
				if (data.success){
					element("attachImage").setAttribute("src", data.data.thumb);
					element("cimg").value = data.data.link + ";" + data.data.thumb;
				} else if (data.data.redirect) {
					manageLogin(data.data);
					element("commentAttachPreview").classList.add("hidden");
					element("attachImage").setAttribute("src", "");
				} else {
					alert(JSON.stringify(data.data));
					element("commentAttachPreview").classList.add("hidden");
					element("attachImage").setAttribute("src", "");
				}
			});
		}
	}
	
	//evento: al pegar una imagen
	//TODO: limpiar codigo repetido.
	$("#commentTextarea").on("paste", function(e) {
		//solo leer imagenes e ignorar texto o links.
		let actionPaste = e.originalEvent.clipboardData.getData("text/html");
		let context = $('<div>').append(actionPaste);
		let imgURL = $(context).find("img").attr("src");
		if (imgURL){
			
			let formData = new FormData();
			formData.append("link", imgURL);
			post(formData, "/api/uplink", function(target){
				if (isImg(imgURL)){
					element("attachImage").setAttribute("src", imgURL);
					element("commentAttachPreview").classList.remove("hidden");
				}
				element("sendComIcon").classList.remove("hidden");
				element("commentButtonText").classList.add("hidden");
			}, function(data){
				element("sendComIcon").classList.add("hidden");
				element("commentButtonText").classList.remove("hidden");
				if (data.success){
					let mediaData = data.data;
					element("cimg").value = mediaData.raw + ";" + mediaData.thumb;
					element("attachImage").setAttribute("src", mediaData.thumb);
					element("commentAttachPreview").classList.remove("hidden");
				} else if (data.data.redirect) {
					manageLogin(data.data);
					element("attachImage").setAttribute("src", "");
					element("commentAttachPreview").classList.add("hidden");
				} else {
					alert(JSON.stringify(data.data));
					element("attachImage").setAttribute("src", "");
					element("commentAttachPreview").classList.add("hidden");
				}
			});
			
		}
	});
	
	//elegir archivo en tema
	if (element("bfile")){
		element("bfile").addEventListener("change", function(e){
			let file = element("bfile").files.item(0);
			
			getDataURL(file, function(target){
				element("postImg").setAttribute("src", target);
				element("sendLText").classList.add("hidden");
				element("sendLIcon").classList.remove("hidden");
			}, function(data){
				element("sendLText").classList.remove("hidden");
				element("sendLIcon").classList.add("hidden");
				if (data.success){
					element("bimg").value = data.data.link + ";" + data.data.thumb;
					element("postImg").setAttribute("src", data.data.thumb);
					element("panelBTop").style.display = "block";
				} else if (data.data.redirect) {
					manageLogin(data.data);
				} else {
					alert(data.data);
				}
			});
			
		});
	}
	
	//evento: elegir link en tema
	if (element("linkButtonPost")){
		element("linkButtonPost").addEventListener("click", function(e){
			if (element("linkSelector").classList.contains("hidden")){
				element("linkSelector").classList.remove("hidden");
				element("linkUnselect").classList.add("hidden");
				element("linkSelect").classList.remove("hidden");
				
			} else {
				element("linkSelector").classList.add("hidden");
				element("linkUnselect").classList.remove("hidden");
				element("linkSelect").classList.add("hidden");
				
				//al cerrar detectar si hay link
				var link = $("input[name=burl]").val();
				if (link.trim() != ""){
					element("burl").value = "";
					element("bimg").value = "";
					element("bvid").value = "";
					
					//subir link
					let formData = new FormData();
					formData.append("link", link);
					post(formData, "/api/uplink", function(target){
						if (isImg(link)){
							element("postImg").setAttribute("src", link);
						}
						element("sendLText").classList.add("hidden");
						element("sendLIcon").classList.remove("hidden");
					}, function(data){
						element("sendLText").classList.remove("hidden");
						element("sendLIcon").classList.add("hidden");
						if (data.success){
							let mediaData = data.data;
							if (mediaData.video){
								element("bvid").value = mediaData.raw + ";" + mediaData.thumb;
								element("btitle").value = mediaData.title;
								//mostrar opcion de sincronizacion
								element("vidsync").classList.remove("hidden");
							} else {
								element("bimg").value = mediaData.raw + ";" + mediaData.thumb;
							}
							//mostrar imagen en el cuadro de preview
							element("postImg").setAttribute("src", mediaData.thumb);
							element("panelBTop").style.display = "block";
							
						} else if (data.data.redirect) {
							manageLogin(data.data);
						} else {
							alert(data.data);
						}
					});
				}
				
			}
		});
	}
	
	//evento: elegir link en comentarios
	if (element("linkButton")){
		element("linkButton").addEventListener("click", function(e){
			
			if (element("curl").classList.contains("hidden")){
				element("curl").classList.remove("hidden");
				element("clinkUnselect").classList.add("hidden");
				element("clinkSelect").classList.remove("hidden");
			} else {
				element("curl").classList.add("hidden");
				element("clinkUnselect").classList.remove("hidden");
				element("clinkSelect").classList.add("hidden");
				
				//leer link
				var link = $("input[name=curl]").val();
				if (link.trim() != ""){
					element("curl").value = "";
					element("cimg").value = "";
					element("cvid").value = "";
				
					let formData = new FormData();
					formData.append("link", link);
					post(formData, "/api/uplink", function(target){
						if (isImg(link)){
							element("attachImage").setAttribute("src", link);
							element("commentAttachPreview").classList.remove("hidden");
						}
						element("sendComIcon").classList.remove("hidden");
						element("commentButtonText").classList.add("hidden");
					}, function(data){
						element("sendComIcon").classList.add("hidden");
						element("commentButtonText").classList.remove("hidden");
						if (data.success){
							let mediaData = data.data;
							if (mediaData.video){
								element("cvid").value = mediaData.raw + ";" + mediaData.thumb;
							} else {
								element("cimg").value = mediaData.raw + ";" + mediaData.thumb;
							}
							element("attachImage").setAttribute("src", mediaData.thumb);
							element("commentAttachPreview").classList.remove("hidden");
						} else if (data.data.redirect) {
							manageLogin(data.data);
						} else {
							alert(data.data);
						}
					});
				}
			}
		});
	}

	//enviar comentario
	if (element("commentSend")){
		element("commentSend").addEventListener("click", function(e){
			e.preventDefault();
			let form = $("#commentForm").serialize();
			postForm(form, "/api/com", function(target){
				element("sendComIcon").classList.remove("hidden");
				element("commentButtonText").classList.add("hidden");
				element("commentForm").classList.remove("floatBox");
				
				//experimental de render instantaneo
				action_instantRender(form);
				resetCommentInputData();
				
			}, function(result){
				clearTempComments();
				element("sendComIcon").classList.add("hidden");
				element("commentButtonText").classList.remove("hidden");
				if (result.success){
					//resetCommentInputData();
				} else if (result.data.redirect){
					manageLogin(result.data);
					restoreCommentInputData();
				} else {
					alert(result.data);
					restoreCommentInputData();
				}
			});
		});
	}
	
	if (element("commentTextarea")){
		element("commentTextarea").addEventListener("keydown", function(e){
			if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
				element("commentSend").click();
			}
		});
	}
	
	//enviar post
	if (element("postSend")){
		element("postSend").addEventListener("click", function(e){
			e.preventDefault();
			
			//añadir texto del rich text editor
			element("postTextContent").value = element("richEditor").innerHTML;
			
			let form = $("#postForm").serialize();
			postForm(form, "/api/new", function(target){
				element("sendLText").classList.add("hidden");
				element("sendLIcon").classList.remove("hidden");
			}, function(result){
				element("sendLText").classList.remove("hidden");
				element("sendLIcon").classList.add("hidden");
				if (result.success){
					window.location.href = result.data.url;
				} else if (result.data.redirect){
					manageLogin(result.data);
				} else {
					alert(result.data);
				}
			});
		});
	}
	
	$(document).on("click", ".menu-group", function (e) {
		let data = $(e.currentTarget).data();
		if (element(data.target)){
			element(data.target).classList.toggle("hidden");
		}
	});
	
	//aumentar imagen
	$(document).on("click", ".media", function (e) {
		let data = $(e.currentTarget).data().img.split(";");
		let imgElement = $(e.currentTarget).children().first();
		
		if ($(e.currentTarget).parent().hasClass("mainPostMediaContainer")){
			if ($(e.currentTarget).parent().hasClass("postExpand")){
				imgElement.attr("src", data[0]);
			} else {
				imgElement.attr("src", data[1]);
			}
			$(e.currentTarget).parent().toggleClass("postExpand");
		} else {
			if ($(e.currentTarget).hasClass("expand")){
				imgElement.attr("src", data[0]);
			} else {
				imgElement.attr("src", data[1]);
			}
			$(e.currentTarget).toggleClass("expand");
		}
	});
	
	//ver imagen de portada
	if (element("metaImage")){
		element("metaImage").addEventListener("click", function(e){
			let data = $(e.currentTarget).data();
			let quote = $(document).find("#floatQuote");
			quote.toggleClass("hidden");
			quote.toggleClass("popupw");
			quote.css({left: e.pageX, top: e.pageY});
			$(document).find("#floatQuote").html(`<img src="${data.img}" style="width: 100%;height: 100%;"></img>`);
		});
	}
	
	//ELEMENTOS DEL NAVBAR
	if (element("searchButton")){
		element("searchButton").addEventListener("click", function(e){
			element("searchPopup").classList.toggle("hidden");
		});
	}
	
	if (element("newPostButton")){
		element("newPostButton").addEventListener("click", function(e){
			element("newPostViewContainer").classList.toggle("hidden");
		});
	}
	
	if (element("notifButton")){
		element("notifButton").addEventListener("click", function(e){
			element("notifMenu").classList.toggle("hidden");
		});
	}	
	
	if (element("generalButton")){
		element("generalButton").addEventListener("click", function(e){
			element("generalMenu").classList.toggle("hidden");
		});
	}
		
	//evento: accion de creacion de id
	if (element("idButton")){
		element("idButton").addEventListener("click", function(e){
			e.preventDefault();
			let userid = element("userid").value;
			let formdata = new FormData();
			
			formdata.append("userid", userid);
			post(formdata, "/api/idlogin", function(){
				
			}, function(result){
				
				if (result.success){
					element("idLogin").classList.add("hidden");
				} else if (result.data.redirect){
					manageLogin(result.data);
				} else {
					alert(result.data);
				}
			});
			
		});
		element("idClose").addEventListener("click", function(e){
			element("idLogin").classList.add("hidden");
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
	
	//evento: ir al final de página
	if (element("goDown")){
		element("goDown").addEventListener("click", function(e){
			window.scrollTo(0, document.body.scrollHeight);
		});
	}
	
	if (element("autoLoad")){
		element("autoLoad").addEventListener("click", function(e){
			AUTOLOAD_COMMENTS = (AUTOLOAD_COMMENTS) ? false : true;
			element("autoLoad").classList.toggle("enabled");
		});
	}
	
	if (element("postFiles")){
		element("postFiles").addEventListener("click", function(e){
			
			if (element("commentFiles").classList.contains("hidden")){
				element("commentFiles").classList.remove("hidden");
				element("commentList").classList.add("hidden");
				element("commentsTitle").innerText = "Archivos";
				element("commentCounter").innerText = $("#commentFiles > .file").length;
				
			} else {
				element("commentFiles").classList.add("hidden");
				element("commentList").classList.remove("hidden");
				element("commentsTitle").innerText = "Comentarios";
				element("commentCounter").innerText = $("#commentList > .comment").length;
				
			}
			
		});
	}
	
	if (element("attach-goup")){
		element("attach-goup").addEventListener("click", function(e){
			var fistElementPosition = $(".commentList").position().top - 150;
			document.documentElement.scrollTo({top: fistElementPosition});
		});
	}
	
	if (element("goComment")){
		element("goComment").addEventListener("click", function(e){
			element("commentForm").classList.toggle("hidden");
		});
	}
	
	if (element("attach-comment")){
		element("attach-comment").addEventListener("click", function(e){
			element("commentForm").classList.add("floatBox");
		});
	}
	
	if (element("closeCommentBox")){
		element("closeCommentBox").addEventListener("click", function(e){
			[].forEach.call(document.querySelectorAll(".jump"), function(e) {e.classList.remove("jump");});
			element("commentForm").classList.remove("floatBox");
			element("attach-comment").classList.add("hidden");
		});
	}
	
	//evento: click en favorito en box
	if (element("postActionFav")){
		element("postActionFav").addEventListener("click", function(e){
			let bid = $(e.currentTarget).data().bid;
			
			if ($(e.currentTarget).hasClass("faved")){
				$(e.currentTarget).removeClass("faved");
				applyConfig("favs_del:" + bid);
			} else {
				$(e.currentTarget).addClass("faved");
				applyConfig("favs_add:" + bid);
			}
		});
	}
	
	//evento: click en ocultar en box.
	if (element("postActionHide")){
		element("postActionHide").addEventListener("click", function(e){
			let bid = $(e.currentTarget).data().bid;
			if ($(e.currentTarget).hasClass("hided")){
				$(e.currentTarget).removeClass("hided");
				applyConfig("boxhides_del:" + bid);
			} else {
				$(e.currentTarget).addClass("hided");
				applyConfig("boxhides_add:" + bid);
			}
		});
	}
	
	//evento: eliminar imagen incrustada
	if (element("attachImageClose")){
		element("attachImageClose").addEventListener("click", function(e){
			element("cvid").value = "";
			element("cimg").value = "";
			element("commentAttachPreview").classList.add("hidden");
			element("attachImage").setAttribute("src", "");
		});
	}
	
	//evento: limpiar notificaciones
	$(document).on("click", "#clearNotifications", function(e){
		request("/api/ntf/clear", function(data){
			$("#notifButton").load(document.URL + " #notifButton>*", function(){
				$("#notifMenu").load(document.URL + " #notifMenu>*", function(){
					let count = parseInt($("#notifCount").text());
					console.log(count);
					action_titleAppendCounter(count);
				});
			});
		});
	});
	
	//evento: mini dropdown en comentario
	$(document).on("click", ".metaElement.ficon.pointer.actionMod", function(e){
		$(e.currentTarget).find(".nanodropdown").toggleClass("hidden");
	});
	
	//evento: votar encuesta
	$(document).on("click", ".pollVoteButton", function(e){
		let option = $(e.currentTarget).data("poll");
		let bid = $(e.currentTarget).data("bid");
		
		let formData = new FormData();
		formData.append("vote", option);
		formData.append("bid", bid);
		
		post(formData, "/api/poll", function(){
			$(e.currentTarget).addClass("pollLoading");
			
		}, function(result){
			if (result.success){
				//actualizar opcion seleccionada.
				$(e.currentTarget).addClass("voted");
				
				//activar señal de voto
				element("pollc").value = "1";
				element("pollcOpt" + result.data.option).classList.remove("hidden");
				action_pollUpdate(result.data);
			} else if (result.data.redirect){
				manageLogin(result.data);
			} else {
				alert(result.data);
			}
			$(e.currentTarget).removeClass("pollLoading");
		});
		
	});
	
	//evento: ocultar categoria
	$(document).on("click", ".categoryHide", function(e){
		let catid = $(e.currentTarget).data("catid");
		
		if ($(e.currentTarget).hasClass("cathidden")){
			$(e.currentTarget).removeClass("cathidden");
			applyConfig(`cathides_del:${catid}`);
			$(e.currentTarget).text("Ocultar de la home");
		} else {
			$(e.currentTarget).addClass("cathidden");
			applyConfig(`cathides_add:${catid}`);
			$(e.currentTarget).text("Mostrar en la home");
		}
	});
	
	//evento: imagenes incrustadas en post
	$(document).on("click", ".mainPostBody > .attImage", function(e){
		let data = $(e.currentTarget).children().data("img").split("|");
		window.open(data[1]);
	});
	
});
