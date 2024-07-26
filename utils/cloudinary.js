const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");

// Cloudinary configuration --------------------------------

const cloudinaryUpload = async (filePath) => {
	try {
		const response = await cloudinary.uploader.upload(filePath, {
			resource_type: "auto",
		});

		fs.unlinkSync(filePath);
		return response;
	} catch (err) {
		fs.unlinkSync(filePath);
		return null;
	}
};

const cloudinaryDelete = async (publicID) => {
	try {
		const response = await cloudinary.uploader.destroy(publicID);

		return response;
	} catch (err) {
		return null;
	}
};

const cloudinaryDownload = async (publicID) => {
	try {
		const response = await cloudinary.url(publicID, {
			secure: true,
		});

		return response;
	} catch (err) {
		return err;
	}
};

module.exports = { cloudinaryUpload, cloudinaryDelete, cloudinaryDownload };
