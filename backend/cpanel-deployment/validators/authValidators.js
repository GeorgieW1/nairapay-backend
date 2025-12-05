import { body } from "express-validator";

export const registerValidator = [
	body("name").optional().isString().isLength({ min: 2 }).trim(),
	body("email").isEmail().normalizeEmail(),
	body("password").isString().isLength({ min: 6, max: 100 }),
];

export const loginValidator = [
	body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
	body("password").isString().withMessage("Password must be a string").isLength({ min: 6, max: 100 }).withMessage("Password must be between 6 and 100 characters"),
];

export const firebaseLoginValidator = [
	body("idToken").isString().isLength({ min: 10 }),
];

export const forgotPasswordValidator = [
	body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
];

export const resetPasswordValidator = [
	body("resetToken").isString().withMessage("Reset token is required"),
	body("newPassword").isString().isLength({ min: 6, max: 100 }).withMessage("Password must be between 6 and 100 characters"),
];
