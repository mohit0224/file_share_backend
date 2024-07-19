const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Cloudinary configuration --------------------------------
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const cloudinaryDelete = async (filePath) => {
	try {
		const response = await cloudinary.uploader.destroy(filePath);

		return response;
	} catch (err) {
		return null;
	}
};

module.exports = { cloudinaryUpload, cloudinaryDelete };
