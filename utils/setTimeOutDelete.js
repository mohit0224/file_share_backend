const File = require("../models/file.models");
const User = require("../models/users.models");
const { cloudinaryDelete } = require("./cloudinary");

const setTimeOut = ({ publicId, fileID }) => {
	setTimeout(async () => {
		const fileExists = await File.findById(fileID);
		if (fileExists) {
			await cloudinaryDelete(publicId);
			const deleteFIle = await File.findByIdAndDelete(fileID);
			const user = await User.findById(deleteFIle.userID);
			user.files.splice(user.files.indexOf(fileID), 1);
			await user.save();
		}
	}, 20 * 1000);
};

module.exports = setTimeOut;
