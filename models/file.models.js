const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
	{
		userID: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "user",
		},
		imageName: {
			type: "String",
		},
		imageURL: {
			type: "String",
		},
		password: {
			type: "String",
		},
		isPasswordProtected: {
			type: "Boolean",
			default: false,
		},
		isFileShareable: {
			type: "Boolean",
			default: true,
		},
	},
	{ timestamps: true }
);

const File = mongoose.model("File", fileSchema);

module.exports = File;
