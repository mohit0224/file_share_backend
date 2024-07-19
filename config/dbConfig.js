const mongoose = require("mongoose");

const dbConfig = async () => {
	try {
		const { connections } = await mongoose.connect(process.env.MONGODB_URI, {
			dbName: process.env.MONGODB_dbname,
		});

		if (connections[0].readyState === 1) {
			console.log(`Database is connected on host :: ${connections[0].host}`);
		}
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = dbConfig;
