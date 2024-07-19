const bcrypt = require("bcrypt");

const hashPassword = async (password) => {
	try {
		const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT));
		return await bcrypt.hash(password, salt);
	} catch (err) {
		throw new Error("Something went wrong !!");
	}
};

const comparePassword = async (password, hPassword) => {
	try {
		return await bcrypt.compare(password, hPassword);
	} catch (err) {
		throw new Error("Something went wrong, while checking the credentials !!");
	}
};

module.exports = { hashPassword, comparePassword };
