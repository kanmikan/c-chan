const sConfig = require('../config/serverconfig.js');
const sanitizeHtml = require('sanitize-html');

function sanitizeAll(raw){
	return sanitizeHtml(raw);
}

function sanitizeComments(raw){
	let tags = sanitizeHtml.defaults.allowedTags.filter(item => item !== 'div');
	
	let attr = sanitizeHtml.defaults.allowedAttributes;
	attr.a = ['href', 'name', 'target', 'class', 'data-*'];
	attr.span = ['class', 'style'];
	
	return sanitizeHtml(raw, {
		allowedAttributes: attr,
		allowedTags: tags
	});
}

function sanitizeBoxs(raw){
	if (sConfig.RTF_BOXS){
		//aceptar formato enriquecido/posts
		return sanitizeHtml(raw, {
			allowedAttributes: {
				'*' : ['data-*'],
				'a': ['href', 'name', 'target', 'class'],
				'img': ['src'],
				'font': ['color', 'size'],
				'div': ['style', 'class'],
				'iframe': ['width', 'height', 'src', 'frameborder', 'allow', 'allowfullscreen'],
				'span': ['class']
			},
			allowedStyles: {
				'div': {
					'text-align': [/^left$/, /^right$/, /^center$/]
				}
			},
			allowedTags: ['b', 'i', 'strong', 'a', 'div', 'span', 'font', 'img', 'iframe']
		});
	} else {
		//redirecciona al sanitizado estricto.
		return sanitizeComments(raw);
	}
}

module.exports = {sanitizeAll, sanitizeComments, sanitizeBoxs}