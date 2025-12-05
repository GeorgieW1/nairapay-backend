import { body, param } from "express-validator";

export const createKeyValidator = [
	body("service").isString().isIn(["airtime", "data", "electricity", "tv", "betting"]),
	body("provider").isString().isLength({ min: 2 }),
	body("key").isString().isLength({ min: 8 }),
];

export const updateKeyValidator = [
	param("id").isMongoId(),
	body("service").optional().isString().isIn(["airtime", "data", "electricity", "tv", "betting"]),
	body("provider").optional().isString().isLength({ min: 2 }),
	body("key").optional().isString().isLength({ min: 8 }),
];

export const idParamValidator = [param("id").isMongoId()];
