const router = require("express").Router();

const multer = require("multer");
const {
	postFile,
	getFile,
	deleteFile,
	downloadFile,
} = require("../controllers/file.controllers");
const isLoggedIn = require("../middlewares/isLoggedIn.middleware");
const upload = require("../middlewares/multer.middleware");
const { apiError } = require("../utils/apiResponse");

router.post(
	"/",
	isLoggedIn,
	upload.single("image"),
	(err, req, res, next) => {
		console.log(err);
		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_SIZE") {
				return res
					.status(404)
					.json(apiError("File size is too large. Max limit is 5MB.", false));
			}
		}

		next();
	},
	postFile
);

router.get("/:fileID", getFile);

router.get("/download/:id", downloadFile);

router.delete("/:id", isLoggedIn, deleteFile);

module.exports = router;
