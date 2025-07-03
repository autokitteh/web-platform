#!/usr/bin/env node

import { spawn } from "child_process";
import { config } from "dotenv";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
config({ path: path.join(dirname, "..", ".env") });

// Run npm run dev with the loaded environment variables
const child = spawn("npm", ["run", "dev"], {
	stdio: "inherit",
	env: {
		...process.env,
		// The .env variables are already loaded by dotenv.config()
	},
});

child.on("close", (code) => {
	process.exit(code);
});
