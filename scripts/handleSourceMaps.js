/* eslint-disable no-console */
/* eslint-disable no-undef */
import { execSync } from "child_process";

console.log("All environment variables:", process.env);

const context = process.env.CONTEXT;
let commitMessage = process.env.COMMIT_MESSAGE || process.env.COMMIT_REF_MESSAGE || "";

if (!commitMessage) {
	try {
		commitMessage = execSync("git log -1 --pretty=%B").toString().trim();
		console.log("Got commit message from git:", commitMessage);
	} catch (error) {
		console.log("Could not get git commit message:", error);
	}
}

console.log("Deploy context:", context);
console.log("Commit message:", commitMessage);

if (context === "production" || commitMessage.includes("chore: debug")) {
	console.log("Production release deploy detected - uploading source maps");
	try {
		execSync("npm run upload-sourcemaps", { stdio: "inherit" });
	} catch (error) {
		console.error("Failed to upload source maps:", error);
		process.exit(1);
	}
} else {
	console.log("Not a release deploy - skipping source maps upload");
	if (context !== "production") {
		console.log("Reason: Not a production deploy");
	}
	if (!commitMessage.includes("chore: debug")) {
		console.log("Reason: Not a debug commit");
	}
}
