const router = require("express").Router();
const { postFile, getFile, deleteFile } = require("../controllers/file.controllers");
const isLoggedIn = require("../middlewares/isLoggedIn.middleware");
const upload = require("../middlewares/multer.middleware");

router.post("/", isLoggedIn, upload.single("image"), postFile);

router.get("/", isLoggedIn, getFile);

router.delete("/:id", isLoggedIn, deleteFile);

module.exports = router;
