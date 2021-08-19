module.exports = {
	DBNAME: "mikandbv2",
	DBURL: "mongodb://127.0.0.1:27017",
	SSL: false,
	PORT: process.env.PORT || 3000,
	SESSION_SECRET: process.env.SESSION_SECRET || "test"
}
