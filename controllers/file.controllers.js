const File = require("../models/file.models");
const User = require("../models/users.models");
const { apiError, apiResponse } = require("../utils/apiResponse");
const {
	cloudinaryUpload,
	cloudinaryDelete,
	cloudinaryDownload,
} = require("../utils/cloudinary");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { extractPublicId } = require("cloudinary-build-url"); // used for the publicId from cloudinary secure url
const setTimeOut = require("../utils/setTimeOutDelete");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types"); // used for get file extension to set the res.setHeader content-type
const fetch = (...args) =>
	import("node-fetch").then(({ default: fetch }) => fetch(...args));

const postFile = async (req, res) => {
	try {
		const { id } = req.user;
		const { password, isPasswordProtected, isFileShareable } = req.body;

		if (req.fileValidationError) {
			return res.status(404).json(apiError(req.fileValidationError, false));
		}

		const file = req.file;
		if (!file)
			return res.status(404).json(apiError("Upload file to process !!", false));

		let createFile, publicId;

		const user = await User.findById(id);
		if (!user) return res.send(404).json(apiError("User not found !!", false));

		if (isPasswordProtected === "true") {
			if (password) {
				const hash = await hashPassword(password);
				const { secure_url, original_filename, format } =
					await cloudinaryUpload(file.path);
				publicId = extractPublicId(secure_url);

				createFile = new File({
					userID: id,
					imageName: `${original_filename}.${format}`,
					imageURL: secure_url,
					password: hash,
					isPasswordProtected,
					isFileShareable: isFileShareable || true,
				});
			} else {
				fs.unlinkSync(file.path);
				return res.status(500).json(apiError("Password is required !!", false));
			}
		} else {
			const { secure_url, original_filename, format } = await cloudinaryUpload(
				file.path
			);
			publicId = extractPublicId(secure_url);
			createFile = new File({
				userID: id,
				imageName: `${original_filename}.${format}`,
				imageURL: secure_url,
				isFileShareable: isFileShareable || true,
			});
		}

		const createdFile = await createFile.save();
		user.files.push(createdFile._id);
		await user.save();

		setTimeOut({ publicId, fileID: createdFile._id });

		return res
			.status(200)
			.json(
				apiResponse(
					"File uploaded successfully, this w'll be deleted after 24 hours !!",
					true,
					createdFile
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
		const { fileID } = req.params;

		const file = await File.findOne({ _id: fileID }).select(
			"-isPasswordProtected -password"
		);

		if (!file)
			return res.status(404).json(apiError("File not found !!", false));

		if (file.isFileShareable) {
			return res.status(200).json(apiResponse("File", true, file));
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
		if (!file)
			return res
				.status(404)
				.json(apiResponse("Link not found or expired !!", false));

		const publicID = extractPublicId(file.imageURL);

		await cloudinaryDelete(publicID);
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

const downloadFile = async (req, res) => {
	try {
		const { id } = req.params;
		const { password } = req.query;
		const file = await File.findById(id);

		if (!file) {
			return res
				.status(404)
				.json(apiError(`Link not found or expired !!`, false));
		}

		const paths = path.extname(file.imageName);
		const mimeType = mime.lookup(paths);

		const publicId = extractPublicId(file.imageURL);

		const url = await cloudinaryDownload(publicId);
		const imageResponse = await fetch(url);

		if (!imageResponse.ok) {
			throw new Error("Image fetch failed");
		}

		if (file.isPasswordProtected) {
			if (password) {
				const verifyPassword = await comparePassword(password, file.password);
				if (!verifyPassword)
					return res
						.status(404)
						.json(apiError("Invalid credentials !!", false));

				res.setHeader(
					"Content-Disposition",
					`attachment; filename=${file.imageName}`
				);
				res.setHeader("Content-Type", mimeType);
				imageResponse.body.pipe(res);
			} else {
				return res.status(404).send(
					new Buffer.from(
						JSON.stringify({
							message:
								"This file is password protected, password is required !!",
						})
					)
				);
			}
		}

		res.setHeader(
			"Content-Disposition",
			`attachment; filename=${file.imageName}`
		);
		res.setHeader("Content-Type", mimeType);
		imageResponse.body.pipe(res);
	} catch (err) {
		return res.status(500).send(
			new Buffer.from(
				JSON.stringify({
					message: err.message,
				})
			)
		);
	}
};

module.exports = { postFile, getFile, deleteFile, downloadFile };
