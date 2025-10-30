import { body } from "express-validator";

export const registerValidator = [
	body("name").optional().isString().isLength({ min: 2 }).trim(),
	body("email").isEmail().normalizeEmail(),
	body("password").isString().isLength({ min: 6, max: 100 }),
];

export const loginValidator = [
	body("email").isEmail().normalizeEmail(),
	body("password").isString().isLength({ min: 6, max: 100 }),
];

export const firebaseLoginValidator = [
	body("idToken").isString().isLength({ min: 10 }),
];
