module.exports = {
	DBNAME: "mikanchan", //uso la base de datos de mikanchan como muestra.
	DBURL: "mongodb://127.0.0.1:27017",
	SSL: false,
	PORT: process.env.PORT || 3000,
	SESSION_SECRET: process.env.SESSION_SECRET || "test"
}
