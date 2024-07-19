const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		username: {
			type: "String",
			unique: true,
		},
		name: {
			type: "String",
			unique: true,
			required: true,
		},
		email: {
			type: "String",
			unique: true,
			required: true,
		},
		password: {
			type: "String",
			unique: true,
			required: true,
		},
		files: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "File",
			},
		],
	},
	{ timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
