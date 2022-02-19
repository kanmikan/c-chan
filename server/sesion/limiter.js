const rateLimit = require('express-rate-limit').default;

const loginLimit = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: {success: false, data: "Superaste el limite maximo de solicitudes"}
});

const apiLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
	message: {success: false, data: "Superaste el limite maximo de solicitudes"}
});

const spamLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 60,
	standardHeaders: true,
	legacyHeaders: false,
	message: {success: false, data: "Superaste el limite maximo de solicitudes"}
});


module.exports = {loginLimit, apiLimit, spamLimit}