const app = require("./app");
const dbConfig = require("./config/dbConfig");
const PORT = process.env.PORT || 3050;

dbConfig()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server is listening on port :: ${PORT}`);
		});
	})
	.catch((err) => {
		console.error(err.message);
		process.exit(1);
	});
