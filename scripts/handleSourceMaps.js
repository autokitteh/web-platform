/* eslint-disable no-console */
/* eslint-disable no-undef */
import { execSync } from "child_process";

const context = process.env.CONTEXT;
const commitMessage = process.env.COMMIT_REF_MESSAGE || "";

console.log("Deploy context:", context);
console.log("Commit message:", commitMessage);

if (context !== "production" && !commitMessage.includes("chore(release)")) {
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
	if (!commitMessage.includes("chore(release)")) {
		console.log("Reason: Not a release commit");
	}
}
