/* eslint-disable no-undef */
import dotenv from "dotenv";
dotenv.config();

if (!process.env.VITE_AUTH_ENABLED) {
	throw new Error("Environment variable - VITE_AUTH_ENABLED not defined");
} else if (!process.env.VITE_DESCOPE_PROJECT_ID && process.env.VITE_AUTH_ENABLED === "true") {
	throw new Error("Environment variable - VITE_DESCOPE_PROJECT_ID not defined for descope authentication");
} else {
	console.log("Environment variables validated successfully.");
}
