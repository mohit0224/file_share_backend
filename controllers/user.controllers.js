const User = require("../models/users.models");
const { apiError, apiResponse } = require("../utils/apiResponse");
const { cloudinaryDelete, cloudinaryUpload } = require("../utils/cloudinary");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const { generateToken } = require("../utils/jwtToken");
const { extractPublicId } = require("cloudinary-build-url");

const userCreate = async (req, res) => {
	try {
		const { username, email, name, password } = req.body;

		const existingUser = await User.findOne({
			$or: [{ username }, { email }],
		});
		if (existingUser?.username === username) {
			return res
				.status(404)
				.json(
					apiError(
						`User already exists by :: ${username}, Login your account.`,
						false
					)
				);
		}
		if (existingUser?.email === email) {
			return res
				.status(404)
				.json(
					apiError(
						`User already exists by :: ${email}, Login your account.`,
						false
					)
				);
		}

		const hash = await hashPassword(password);

		const newUser = new User({
			username,
			email,
			name,
			password: hash,
		});

		const userCreated = await newUser.save();

		return res
			.status(201)
			.json(apiResponse("User created successfully !!", true, userCreated));
	} catch (err) {
		return res
			.status(500)
			.json(apiError(`Error creating user :: ${err.message}`, false));
	}
};

const userLogin = async (req, res) => {
	try {
		const { identifier, password } = req.body;
		if (!identifier) {
			return res
				.status(404)
				.json(apiError(`Please provide username or email.`, false));
		}
		if (!password) {
			return res.status(404).json(apiError(`Please provide password.`, false));
		}
		if (!identifier || !password) {
			return res
				.status(404)
				.json(apiError(`Please provide all feilds.`, false));
		}

		const user = await User.findOne({
			$or: [{ username: identifier }, { email: identifier }],
		});

		if (!user) {
			return res.status(404).json(apiError(`User not found !!`, false));
		}

		const verifyPassword = await comparePassword(password, user.password);

		if (!verifyPassword) {
			return res.status(404).json(apiError("Invalid credentials", false));
		}

		const token = generateToken(user._id);

		res.cookie("token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "none",
			domain: process.env.FRONTEND_ORIGIN,
			maxAge: 24 * 60 * 60 * 1000,
		});
		res
			.status(200)
			.json(apiResponse("User logged in successfully !!", true, {}));
	} catch (err) {
		return res
			.status(500)
			.json(apiError(`Error logging user :: ${err.message}`, false));
	}
};

const userLogout = async (req, res) => {
	try {
		res.cookie("token", "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "none",
			domain: process.env.FRONTEND_ORIGIN,
			maxAge: 0,
		});
		res.status(200).json(apiResponse("logged out successfully !!", true, {}));
	} catch (err) {
		return res
			.status(500)
			.json(apiError(`Error loggout user :: ${err.message}`));
	}
};

const getSingleUser = async (req, res) => {
	try {
		const user = await User.findById(req.user.id)
			.select("-password")
			.populate("files");

		if (!user) {
			return res.send("err");
		}

		return res
			.status(200)
			.json(apiResponse(`User found by this name :: ${user.name}`, true, user));
	} catch (err) {
		return res
			.status(500)
			.json(apiError(`Error getting user :: ${err.message}`, false));
	}
};

const changePassword = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const { oldPassword, newPassword } = req.body;
		if (!user)
			return res.status(404).json(apiError("User not found !!", false));

		const verifyPassword = await comparePassword(oldPassword, user.password);
		if (!verifyPassword)
			return res.status(404).json(apiError("Invalid password !!", false));

		const newHashPassword = await hashPassword(newPassword);

		user.password = newHashPassword;

		await user.save();

		return res
			.status(200)
			.json(apiResponse("Password has been changed !!", true, {}));
	} catch (err) {
		return res.status(500).json(apiError(err.message, false));
	}
};

const updateProfileImage = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user)
			return res.status(404).json(apiError("User not found !!", false));

		const file = req.file;
		if (!file)
			return res
				.status(404)
				.json(apiError("Upload profile image to process !!", false));

		if (user.userImage) {
			const publicID = extractPublicId(user.userImage);
			await cloudinaryDelete(publicID);
			const { secure_url } = await cloudinaryUpload(file.path);
			user.userImage = secure_url;
			await user.save();
			return res
				.status(200)
				.json(apiResponse("Profile image updated !!", true, user));
		}

		const { secure_url } = await cloudinaryUpload(file.path);
		user.userImage = secure_url;
		await user.save();

		return res
			.status(200)
			.json(apiResponse("Profile image updated !!", true, user));
	} catch (err) {
		return res.status(500).json(apiError(err.message, false));
	}
};

module.exports = {
	userCreate,
	userLogin,
	userLogout,
	getSingleUser,
	changePassword,
	updateProfileImage,
};
