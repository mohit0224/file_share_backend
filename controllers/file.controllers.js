const File = require("../models/file.models");
const User = require("../models/users.models");
const { apiError, apiResponse } = require("../utils/apiResponse");
const { cloudinaryUpload, cloudinaryDelete } = require("../utils/cloudinary");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { extractPublicId } = require("cloudinary-build-url");

const postFile = async (req, res) => {
	try {
		const { id } = req.user;
		const { path } = req.file;
		const { password, isPasswordProtected, isFileShareable } = req.body;

		const { secure_url } = await cloudinaryUpload(path);
		const publicId = extractPublicId(secure_url);

		let createFile;

		const user = await User.findById(id);

		if (!user) {
			return res.send(404).json(apiError("User not found !!", false));
		}

		if (isPasswordProtected) {
			if (password) {
				const hash = await hashPassword(password);
				if (secure_url) {
					createFile = new File({
						userID: id,
						fileName: secure_url,
						password: hash,
						isPasswordProtected,
						isFileShareable: isFileShareable || true,
					});
				}
			} else {
				return res.send(500).json(apiError("Password is required !!", false));
			}
		} else {
			if (secure_url) {
				createFile = new File({
					userID: id,
					fileName: secure_url,
					isFileShareable: isFileShareable || true,
				});
			}
		}

		const createdFile = await createFile.save();
		user.files.push(createdFile._id);
		await user.save();

		setTimeout(async () => {
			await cloudinaryDelete(publicId);
			await File.findByIdAndDelete(createFile._id);
			user.files.splice(user.files.indexOf(createFile._id), 1);
			await user.save();
		});

		return res
			.status(200)
			.json(
				apiResponse(
					"File uploaded successfully, this w'll be deleted after 24 hours !!",
					true,
					{}
				)
			);
	} catch (err) {
		return res
			.status(500)
			.json(apiError(`Error while uploading file :: ${err.message}`, false));
	}
};

const getFile = async (req, res) => {
	try {
		const { fileID, pass } = req.query;
		const userID = req.user.id;

		const user = await User.findById(userID);
		if (!user) {
			return res.status(404).json(apiResponse("User not found !!", false));
		}

		const findFile = await File.findOne({ _id: fileID }).select(
			"-isPasswordProtected -isFileShareable"
		);

		if (!findFile)
			return res.status(404).json(apiError(`Data not found`, false));
        
		if (pass) {
			const verifyPass = await comparePassword(pass, findFile.password);
			if (verifyPass) {
				return res.status(200).json(apiResponse("File", true, findFile));
			} else {
				return res
					.status(500)
					.json(apiError(`Please access your file without password`, false));
			}
		} else {
			return res.status(200).json(apiResponse("File", true, findFile));
		}
	} catch (err) {
		return res
			.status(500)
			.json(apiError(`Error while getting file :: ${err.message}`, false));
	}
};

const deleteFile = async (req, res) => {
	try {
		const userID = req.user.id;
		const fileID = req.params.id;

		const user = await User.findById(userID);
		if (!user)
			return res.status(404).json(apiResponse("User not found", false));

		const file = await File.findById(fileID);

		await cloudinaryDelete(file.fileName);
		await File.findByIdAndDelete(fileID);
		user.files.splice(user.files.indexOf(fileID), 1);
		await user.save();

		res.status(200).json(apiResponse("File deleted successfully !!", true, {}));
	} catch (err) {
		return res
			.status(500)
			.json(apiError(`Error while deleting :: ${err.message}`, false));
	}
};

module.exports = { postFile, getFile, deleteFile };
