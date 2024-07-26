const app = require("./app");
const dbConfig = require("./config/dbConfig");
const PORT = process.env.PORT || 3050;
const cluster = require("cluster");
const os = require("os");

const nCpu = os.cpus().length;

if (cluster.isMaster) {
	for (let i = 0; i < nCpu; i++) {
		cluster.fork();
	}
	cluster.on("exit", (worker, code, signal) => {
		cluster.fork();
	});
} else {
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
}
