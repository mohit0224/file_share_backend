require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
);

console.log(process.env.CORS_ORIGIN)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// ----------------------------------------------------------------
const userRouter = require("./routes/user.routes");
const fileRouter = require("./routes/file.routes");

app.use("/api/v1/users", userRouter);
app.use("/api/v1/files", fileRouter);

module.exports = app;
