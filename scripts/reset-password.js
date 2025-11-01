import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

async function run() {
	const [email, newPassword, makeAdminFlag] = process.argv.slice(2);
	if (!email || !newPassword) {
		console.error("Usage: node scripts/reset-password.js <email> <newPassword> [makeAdmin]");
		process.exit(1);
	}

	try {
		await connectDB();
		const user = await User.findOne({ email });
		if (!user) {
			console.error(`User not found: ${email}`);
			process.exit(1);
		}

		const hashed = await bcrypt.hash(newPassword, 10);
		user.password = hashed;
		if (makeAdminFlag && makeAdminFlag.toLowerCase() === "makeadmin") {
			user.role = "admin";
		}
		await user.save();

		console.log(
			"Password reset successful" + (user.role === "admin" ? " and user promoted to admin" : "") + "."
		);
		process.exit(0);
	} catch (err) {
		console.error("Reset failed:", err.message);
		process.exit(1);
	} finally {
		await mongoose.connection.close().catch(() => {});
	}
}

run();


