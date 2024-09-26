/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

function extractDirectoryContents(dirPath) {
	const result = [];

	function processDirectory(currentPath, isRoot = true) {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const entries = fs.readdirSync(currentPath, { withFileTypes: true });

		const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
		const directories = entries.filter((entry) => entry.isDirectory());

		if (!isRoot || !directories.length) {
			result.push({
				assetDirectory: path.relative(dirPath, currentPath),
				files,
			});
		}

		for (const dir of directories) {
			processDirectory(path.join(currentPath, dir.name), false);
		}
	}

	processDirectory(dirPath);

	return result;
}

function saveToFile(data, outputPath) {
	const jsonData = JSON.stringify(data, null, 2);
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	fs.writeFileSync(outputPath, jsonData);
	// eslint-disable-next-line no-console
	console.log(`Output saved to ${outputPath}`);
}

// Usage example
const targetDirectory = process.argv[2] || ".";
const outputFile = process.argv[3] || "directory_contents.json";

const extractedContents = extractDirectoryContents(targetDirectory);
saveToFile(extractedContents, outputFile);
