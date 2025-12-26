import { verifyToken } from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Mock objects
const req = {
    headers: {},
    user: null
};

const res = {
    status: (code) => {
        console.log(`Response Status: ${code}`);
        return res;
    },
    json: (data) => {
        console.log("Response JSON:", data);
        return res;
    }
};

const next = () => {
    console.log("✅ next() called - Token verified successfully!");
};

// Setup
const secret = "test_secret";
process.env.JWT_SECRET = secret;
const token = jwt.sign({ id: "user123" }, secret);

async function runTests() {
    console.log("🔹 Test 1: Bearer Token");
    req.headers.authorization = `Bearer ${token}`;
    verifyToken(req, res, next);

    console.log("\n🔹 Test 2: Raw Token (No Bearer)");
    req.headers.authorization = token;
    verifyToken(req, res, next);

    console.log("\n🔹 Test 3: Bearer with extra spaces");
    req.headers.authorization = `Bearer   ${token}`;
    verifyToken(req, res, next);

    console.log("\n🔹 Test 4: Invalid Token");
    req.headers.authorization = "Bearer invalidqt";
    verifyToken(req, res, next); // Should fail

    console.log("\n🔹 Test 5: No Header");
    req.headers.authorization = undefined;
    verifyToken(req, res, next); // Should fail
}

runTests();
