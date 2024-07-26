require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const corsOption = {
	origin: process.env.CORS_ORIGIN,
	credentials: true,
};

const app = express();
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(cors(corsOption));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ----------------------------------------------------------------
const userRouter = require("./routes/user.routes");
const fileRouter = require("./routes/file.routes");

app.use("/api/v1/users", userRouter);
app.use("/api/v1/files", fileRouter);

module.exports = app;
