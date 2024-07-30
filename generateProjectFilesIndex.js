import { readdir, stat, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesDir = join(__dirname, "src", "assets", "templates");

const filesPerProject = {};

async function generateIndex() {
	try {
		const projects = await readdir(templatesDir);

		for (const project of projects) {
			const projectPath = join(templatesDir, project);

			const stats = await stat(projectPath);
			if (stats.isDirectory()) {
				const files = await readdir(projectPath);

				filesPerProject[project] = files;
			}
		}

		const indexContent = `export const filesPerProject = ${JSON.stringify(filesPerProject, null, 2)};\n`;

		const indexPath = join(templatesDir, "index.js");
		await writeFile(indexPath, indexContent, "utf8");

		// eslint-disable-next-line no-console
		console.log("index.js has been generated successfully.");
	} catch (error) {
		console.error("Error generating index.js:", error);
	}
}

generateIndex();
