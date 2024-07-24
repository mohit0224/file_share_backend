const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/");
	},
	filename: function (req, file, cb) {
		cb(null, `${file.originalname}`);
	},
});

const fileFilter = (req, file, cb) => {
	let ext = path.extname(file.originalname);
	if (
		ext !== ".png" &&
		ext !== ".jpg" &&
		ext !== ".gif" &&
		ext !== ".jpeg" &&
		ext !== ".webp"
	) {
		req.fileValidationError =
			"Only images and gif files are allowed, file be like ( png, jpg, gif, jpeg, webp ) !!";
		return cb(null, false, req.fileValidationError);
	}
	cb(null, true);
};

const fileSize = 5 * 1024 * 1024;

const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize },
});

module.exports = upload;
