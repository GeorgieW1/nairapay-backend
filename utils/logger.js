import pino from "pino";

const logger = pino({
	level: process.env.NODE_ENV === "production" ? "info" : "debug",
	redact: {
		paths: [
			"req.headers.authorization",
			"req.headers.cookie",
			"req.body.password",
			"req.body.key",
			"req.body.secret",
			"res.body.token",
			"res.body.key",
			"res.body.secret",
		],
		remove: true,
	},
});

export default logger;
