const router = require("express").Router();
const {
	userCreate,
	userLogin,
	userLogout,
	getSingleUser,
	changePassword,
	updateProfileImage,
} = require("../controllers/user.controllers");

const isLoggedIn = require("../middlewares/isLoggedIn.middleware");
const upload = require("../middlewares/multer.middleware");

router.post("/", userCreate);

router.post("/login", userLogin);

router.post("/logout", userLogout);

router.get("/", isLoggedIn, getSingleUser);

router.post("/change-password", isLoggedIn, changePassword);

router.post(
	"/update-user-image",
	isLoggedIn,
	upload.single("userImage"),
	(err, req, res, next) => {
		console.log(err);
		if (err instanceof multer.MulterError) {
			if (err.code === "LIMIT_FILE_SIZE") {
				return res
					.status(404)
					.json(apiError("File size is too large. Max limit is 5MB.", false));
			}
		}

		next();
	},
	updateProfileImage
);

module.exports = router;
