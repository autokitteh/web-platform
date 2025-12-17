#!/usr/bin/env node

import readline from "readline";
import { spawn } from "child_process";

const args = process.argv.slice(2);
const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"];

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

const promptYesNo = (question, defaultYes = false) => {
	return new Promise((resolve) => {
		const hint = defaultYes ? "[Y/n]" : "[y/N]";
		rl.question(`${question} ${hint}: `, (answer) => {
			const normalized = answer.toLowerCase().trim();
			if (normalized === "") resolve(defaultYes);
			else resolve(normalized === "y" || normalized === "yes");
		});
	});
};

const promptText = (question, defaultValue = "") => {
	return new Promise((resolve) => {
		const hint = defaultValue ? ` [${defaultValue}]` : "";
		rl.question(`${question}${hint}: `, (answer) => {
			resolve(answer.trim() || defaultValue);
		});
	});
};

const runAct = (config) => {
	const baseConfig = {
		workflows: ".github/workflows/build_test_and_release.yml",
		job: "test",
		secretFile: ".secrets",
		varFile: ".vars",
		platform: "ubuntu-latest=catthehacker/ubuntu:act-latest",
	};

	const actArgs = [
		"--workflows",
		baseConfig.workflows,
		"--job",
		baseConfig.job,
		"--secret-file",
		baseConfig.secretFile,
		"--var-file",
		baseConfig.varFile,
		"--platform",
		baseConfig.platform,
		"--matrix",
		`browser:${config.browser}`,
		"--bind",
		"--privileged",
	];

	if (config.verbose) actArgs.push("--verbose");
	if (config.debug) actArgs.push("--debug");
	if (config.reuse) actArgs.push("--reuse");
	if (config.testFile) actArgs.push("--env", `TEST_FILE=${config.testFile}`);

	const flagsDisplay = [
		config.verbose && "verbose",
		config.debug && "debug",
		config.reuse && "reuse container",
		config.testFile && `file: ${config.testFile}`,
	]
		.filter(Boolean)
		.join(", ");

	console.log(`\n🎭 Running Act with browser: ${config.browser}${flagsDisplay ? ` (${flagsDisplay})` : ""}...\n`);

	const act = spawn("act", actArgs, {
		stdio: "inherit",
		shell: false,
	});

	act.on("close", (code) => {
		process.exit(code);
	});

	act.on("error", (err) => {
		console.error("Failed to start Act:", err.message);
		console.error("Make sure 'act' is installed: https://github.com/nektos/act");
		process.exit(1);
	});
};

const parseCliArgs = () => {
	const browserArg = args.find((a) => a.startsWith("--browser="));
	const fileArg = args.find((a) => a.startsWith("--file="));

	return {
		browser: browserArg ? browserArg.split("=")[1] : null,
		verbose: args.includes("--verbose") || args.includes("--logs"),
		debug: args.includes("--debug"),
		reuse: args.includes("--reuse") || args.includes("--keep"),
		testFile: fileArg ? fileArg.split("=")[1] : null,
		interactive: !args.some((a) => a.startsWith("--browser=")) && args.length === 0,
	};
};

const main = async () => {
	const cliConfig = parseCliArgs();

	if (!cliConfig.interactive) {
		if (cliConfig.browser && !BROWSERS.includes(cliConfig.browser)) {
			console.error(`Invalid browser: ${cliConfig.browser}. Valid options: ${BROWSERS.join(", ")}`);
			process.exit(1);
		}
		rl.close();
		runAct({
			browser: cliConfig.browser || "Chrome",
			verbose: cliConfig.verbose,
			debug: cliConfig.debug,
			reuse: cliConfig.reuse,
			testFile: cliConfig.testFile,
		});
		return;
	}

	console.log("\n🎭 Act - Run GitHub Actions Locally\n");

	const browser = await prompt("Select browser:", BROWSERS.map((b) => ({ label: b, value: b })));

	const outputMode = await prompt("Output mode:", [
		{ label: "Normal (minimal output)", value: "normal" },
		{ label: "Verbose (detailed logs)", value: "verbose" },
		{ label: "Debug (maximum detail)", value: "debug" },
	]);

	const reuse = await promptYesNo("Reuse container from previous run?", false);

	const testFile = await promptText("Specific test file (leave empty for all)");

	rl.close();

	runAct({
		browser,
		verbose: outputMode === "verbose",
		debug: outputMode === "debug",
		reuse,
		testFile: testFile || null,
	});
};

main().catch((err) => {
	console.error(err);
	rl.close();
	process.exit(1);
});
