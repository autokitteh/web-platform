/* eslint-disable no-console */
/* eslint-disable no-undef */
import { execSync } from "child_process";

const context = process.env.CONTEXT;
const branch = process.env.BRANCH;

console.log("Deploy context:", context);
console.log("Branch:", branch);

if (context === "production" && branch === "main") {
	console.log("Production deploy detected - uploading source maps");
	try {
		execSync("npm run upload-sourcemaps", { stdio: "inherit" });
	} catch (error) {
		console.error("Failed to upload source maps:", error);
		process.exit(1);
	}
} else {
	console.log("Not a production deploy - skipping source maps upload");
}
