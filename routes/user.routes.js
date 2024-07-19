const router = require("express").Router();
const {
	userCreate,
	userLogin,
	userLogout,
	getSingleUser,
} = require("../controllers/user.controllers");
const isLoggedIn = require("../middlewares/isLoggedIn.middleware");

router.post("/", userCreate);

router.post("/login", userLogin);

router.post("/logout", isLoggedIn, userLogout);

router.get("/", isLoggedIn, getSingleUser);

module.exports = router;
