const jwt = require("jsonwebtoken");

const generateToken = (id) => {
	try {
		return jwt.sign({ id }, process.env.JWT_SECRET);
	} catch (err) {
		throw new Error(
			`Something went wrong, while generating token: ${err.message}`
		);
	}
};

const verifyToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		throw new Error(
			`Something went wrong, while verifying token: ${err.message}`
		);
	}
};

module.exports = { generateToken, verifyToken };
