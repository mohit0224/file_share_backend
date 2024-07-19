const { apiError } = require("../utils/apiResponse");
const { verifyToken } = require("../utils/jwtToken");

const isLoggedIn = (req, res, next) => {
	const { token } = req.cookies;

	if (token) {
		const checkToken = verifyToken(token);

		if (checkToken) {
			req.user = checkToken;
			next();
		}
	} else {
		return res
			.status(404)
			.json(apiError("Invalid token or token not found", false));
	}
};

module.exports = isLoggedIn;
