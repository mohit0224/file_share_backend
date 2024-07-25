require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		credentials: true,
	})
);

app.use(
	session({
		secret: "your-secret-key",
		resave: false,
		saveUninitialized: false,
		cookie: {
			domain: "file-share-backend-0mq5.onrender.com",
			secure: process.env.NODE_ENV === "production", // Use true if on HTTPS
			httpOnly: true,
			path: "/",
			sameSite: "None",
		},
	})
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ----------------------------------------------------------------
const userRouter = require("./routes/user.routes");
const fileRouter = require("./routes/file.routes");

app.use("/api/v1/users", userRouter);
app.use("/api/v1/files", fileRouter);

module.exports = app;
