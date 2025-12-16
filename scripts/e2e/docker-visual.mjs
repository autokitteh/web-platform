#!/usr/bin/env node

import readline from "readline";
import { spawn } from "child_process";

const args = process.argv.slice(2);

const PLAYWRIGHT_VERSION = "1.56.1";
const PLAYWRIGHT_IMAGE = `mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble`;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const prompt = (question, options) => {
	return new Promise((resolve) => {
		console.log(`\n${question}`);
		options.forEach((opt, i) => console.log(`  ${i + 1}) ${opt.label}`));
		rl.question("\nChoice [1]: ", (answer) => {
			const index = parseInt(answer || "1", 10) - 1;
			resolve(options[index]?.value ?? options[0].value);
		});
	});
};

const runDocker = (updateSnapshots) => {
	const dockerConfig = {
		memory: updateSnapshots ? "16g" : "12g",
		memorySwap: updateSnapshots ? "16g" : "12g",
		shmSize: "2g",
	};

	const volumes = [
		"$(pwd):/work",
		"ak-node-modules:/work/node_modules",
		"ak-npm-cache:/work/.npm-docker-cache",
	];

	const envVars = {
		HOME: "/work",
		npm_config_cache: "/work/.npm-docker-cache",
		NODE_OPTIONS: "--max-old-space-size=8192",
		SKIP_BUILD: "true",
		VITE_HOST_URL: "http://host.docker.internal:9980",
		FORCE_COLOR: "1",
	};

	const playwrightCommand = [
		"npm ci --progress=true",
		"npm run generate:connection-test-data",
		`DOCKER_VISUAL_REGRESSION=true npx playwright test --project="Visual Regression" --workers=1${updateSnapshots ? " --update-snapshots" : ""} --reporter=list`,
	].join(" && ");

	const dockerArgs = [
		"run",
		"-t",
		"--rm",
		`--memory=${dockerConfig.memory}`,
		`--memory-swap=${dockerConfig.memorySwap}`,
		`--shm-size=${dockerConfig.shmSize}`,
		"--add-host=host.docker.internal:host-gateway",
		...volumes.flatMap((v) => ["-v", v]),
		"-w",
		"/work",
		...Object.entries(envVars).flatMap(([key, value]) => ["-e", `${key}=${value}`]),
		PLAYWRIGHT_IMAGE,
		"bash",
		"-c",
		playwrightCommand,
	];

	console.log(`\n🐳 Running Docker visual regression tests${updateSnapshots ? " (updating snapshots)" : ""}...\n`);

	const docker = spawn("docker", dockerArgs, {
		stdio: "inherit",
		shell: true,
	});

	docker.on("close", (code) => {
		process.exit(code);
	});

	docker.on("error", (err) => {
		console.error("Failed to start Docker:", err.message);
		process.exit(1);
	});
};

const main = async () => {
	if (args.includes("--update")) {
		rl.close();
		runDocker(true);
		return;
	}

	if (args.includes("--run")) {
		rl.close();
		runDocker(false);
		return;
	}

	console.log("\n🐳 Docker Visual Regression Tests\n");

	const mode = await prompt("What would you like to do?", [
		{ label: "Run tests (compare against existing snapshots)", value: "run" },
		{ label: "Update snapshots (regenerate baseline images)", value: "update" },
	]);

	rl.close();
	runDocker(mode === "update");
};

main().catch((err) => {
	console.error(err);
	rl.close();
	process.exit(1);
});
