const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinaryConfig");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: async (req, file) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname).toLowerCase().slice(1);
		const allowedFormats = ["jpg", "jpeg", "png", "gif", "webp"];
		if (!allowedFormats.includes(ext)) {
			throw new Error("Unsupported file type.");
		}
		return {
			folder: "Image",
			format: ext,
			public_id: `${file.originalname.split(".")[0]}-${uniqueSuffix}`,
		};
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
