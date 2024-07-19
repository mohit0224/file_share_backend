const apiResponse = (message, success, data) => {
	return {
		message,
		success,
		data,
	};
};

const apiError = (message, success) => {
	return {
		message,
		success,
	};
};

module.exports = { apiResponse, apiError };
