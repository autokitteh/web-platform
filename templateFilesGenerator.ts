import fs from "fs/promises";
import path from "path";

const CONSTANTS_FILE = "src/constants/dashboard.constants.ts";
const TEMPLATES_DIR = "src/assets/templates";

interface TemplateCard {
	title: string;
	description: string;
	integrations: string[];
	assetDirectory: string;
	files: string[];
}

interface TemplateCategory {
	name: string;
	cards: TemplateCard[];
}

async function reconstructTemplateCategories() {
	console.log("Starting to reconstruct template categories...");

	const originalContent = await fs.readFile(CONSTANTS_FILE, "utf-8");

	const categoryMatch = originalContent.match(/export const templateProjectsCategories:[^=]+=\s*(\[[\s\S]*?\n\];)/);

	if (!categoryMatch) {
		throw new Error("Could not find templateProjectsCategories in file");
	}

	const existingCategories = await parseExistingCategories(originalContent);
	const newTemplates = await findNewTemplates(existingCategories);

	if (newTemplates.length) {
		const uncategorizedIndex = existingCategories.findIndex((cat) => cat.name === "Uncategorized");
		if (uncategorizedIndex === -1) {
			existingCategories.push({
				name: "Uncategorized",
				cards: newTemplates,
			});
		} else {
			existingCategories[uncategorizedIndex].cards.push(...newTemplates);
		}
	}

	// Generate the complete file content
	const fileContent = generateCompleteFileContent(existingCategories);
	await fs.writeFile(CONSTANTS_FILE, fileContent, "utf-8");
	console.log("Template categories reconstructed and updated successfully!");
}

async function parseExistingCategories(content: string): Promise<TemplateCategory[]> {
	const categories: TemplateCategory[] = [];
	const categoryRegex = /{\s*name:\s*["']([^"']+)["']/g;
	const matches = content.matchAll(categoryRegex);

	for (const match of matches) {
		const categoryName = match[1];
		const categoryStart = match.index;
		if (categoryStart === undefined) continue;

		const categoryContent = findBalancedContent(content.slice(categoryStart));
		if (!categoryContent) continue;

		const category: TemplateCategory = {
			name: categoryName,
			cards: [],
		};

		// Find all card blocks in the category
		const cardRegex = /{\s*title:\s*["']([^"']+)["']/g;
		const cardMatches = categoryContent.matchAll(cardRegex);

		for (const cardMatch of cardMatches) {
			const cardContent = findBalancedContent(categoryContent.slice(cardMatch.index));
			if (!cardContent) continue;

			const card: TemplateCard = {
				title: cardMatch[1],
				description: "",
				integrations: [],
				assetDirectory: "",
				files: [],
			};

			// Extract description with improved handling of quotes and apostrophes
			const descriptionStart = cardContent.indexOf("description:");
			if (descriptionStart !== -1) {
				const desc = cardContent.slice(descriptionStart);

				// Find the first quote after "description:"
				const firstQuoteMatch = desc.match(/description:\s*["']/);
				if (firstQuoteMatch) {
					const quoteChar = desc[firstQuoteMatch.index! + firstQuoteMatch[0].length - 1];
					const startIndex = firstQuoteMatch.index! + firstQuoteMatch[0].length;

					// Find the matching end quote
					let endIndex = startIndex;
					let escaped = false;

					for (let i = startIndex; i < desc.length; i++) {
						if (desc[i] === "\\") {
							escaped = !escaped;
							continue;
						}

						if (desc[i] === quoteChar && !escaped) {
							endIndex = i;
							break;
						}

						if (desc[i] !== "\\") {
							escaped = false;
						}
					}

					if (endIndex > startIndex) {
						card.description = desc
							.slice(startIndex, endIndex)
							.replace(/\\"/g, '"')
							.replace(/\\'/g, "'")
							.trim();
					}
				}
			}

			// Extract integrations array
			const integrationsMatch = cardContent.match(/integrations:\s*\[([\s\S]*?)\]/);
			if (integrationsMatch) {
				card.integrations = integrationsMatch[1]
					.split(",")
					.map((i) => i.trim())
					.filter(Boolean);
			}

			// Extract assetDirectory and files
			const assetMatch = cardContent.match(/assetDirectory:\s*["']([^"']+)["']/);
			if (assetMatch) {
				card.assetDirectory = assetMatch[1];
				card.files = await getActualFiles(assetMatch[1]);
			}

			if (card.assetDirectory) {
				category.cards.push(card);
			}
		}

		categories.push(category);
	}

	return categories;
}

function generateTypeScriptContent(categories: TemplateCategory[]): string {
	const processedCategories = categories.map((category) => ({
		...category,
		cards: category.cards.map((card) => ({
			...card,
			// Preserve description exactly as it was parsed
			description: card.description,
		})),
	}));

	// Initial conversion to JSON
	let content = JSON.stringify(processedCategories, null, 2);

	// Fix integrations arrays
	content = content.replace(/"integrations":\s*\[([\s\S]*?)\]/g, (match, integrations) => {
		if (integrations.trim() === "") {
			return '"integrations": []';
		}
		const cleanedIntegrations = integrations
			.split(",")
			.map((i) => i.trim().replace(/^"(.*)"$/, "$1"))
			.join(", ");

		return `"integrations": [${cleanedIntegrations}]`;
	});

	// Format descriptions while preserving all content
	content = content.replace(/"description":\s*"(.*?)"/g, (match, desc) => {
		// Ensure apostrophes and quotes are preserved properly
		const formattedDesc = desc.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/"/g, '\\"');

		return `"description": "${formattedDesc}"`;
	});

	return content;
}

function findBalancedContent(content: string): string | null {
	let depth = 0;
	let inString = false;
	let stringChar = "";
	const start = content.indexOf("{");

	if (start === -1) return null;

	for (let i = start; i < content.length; i++) {
		const char = content[i];
		const prevChar = i > 0 ? content[i - 1] : "";

		// Handle string boundaries
		if ((char === '"' || char === "'") && prevChar !== "\\") {
			if (!inString) {
				inString = true;
				stringChar = char;
			} else if (char === stringChar) {
				inString = false;
			}
		}

		// Only count braces when not in a string
		if (!inString) {
			if (char === "{") depth++;
			if (char === "}") depth--;
		}

		if (depth === 0) {
			return content.slice(start, i + 1);
		}
	}

	return null;
}

async function findNewTemplates(existingCategories: TemplateCategory[]): Promise<TemplateCard[]> {
	const existingDirs = new Set(existingCategories.flatMap((cat) => cat.cards.map((card) => card.assetDirectory)));

	try {
		const allDirs = await fs.readdir(TEMPLATES_DIR);
		const newTemplates: TemplateCard[] = [];

		for (const dir of allDirs) {
			if (dir.startsWith(".")) continue;

			const fullPath = path.join(TEMPLATES_DIR, dir);
			try {
				const stat = await fs.stat(fullPath);
				if (!stat.isDirectory()) continue;

				if (!existingDirs.has(dir)) {
					newTemplates.push({
						title: formatTitle(dir),
						description: "",
						integrations: [],
						assetDirectory: dir,
						files: await getActualFiles(dir),
					});
				}
			} catch (error) {
				console.warn(`Error processing directory ${dir}:`, error);
			}
		}

		return newTemplates;
	} catch (error) {
		console.error("Error finding new templates:", error);

		return [];
	}
}

function formatTitle(dirName: string): string {
	return dirName
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}

async function getActualFiles(assetDirectory: string): Promise<string[]> {
	const dirPath = path.join(TEMPLATES_DIR, assetDirectory);
	try {
		const items = await fs.readdir(dirPath, { withFileTypes: true });

		return items.filter((item) => item.isFile() && !item.name.startsWith(".")).map((item) => item.name);
	} catch (error) {
		console.warn(`Error reading directory ${dirPath}:`, error);

		return [];
	}
}

function generateCompleteFileContent(categories: TemplateCategory[]): string {
	const categoriesContent = generateTypeScriptContent(categories);

	return `import { HiddenIntegrationsForTemplates, IntegrationsMap } from "@src/enums/components/connection.enum";
import { TemplateCategory } from "@src/types/components";

export const defaultTemplateProjectCategory = "DevOps";

const hiddenTemplateProjectsCategories = [
\t{
\t\tcards: [
\t\t\t{
\t\t\t\tassetDirectory: "quickstart",
\t\t\t\tfiles: ["README.md", "autokitteh.yaml", "program.py"],
\t\t\t},
\t\t],
\t},
];

export const meowWorldProjectName = "quickstart";

export const templateProjectsCategories: TemplateCategory[] = ${categoriesContent};

export const findTemplateFilesByAssetDirectory = async (assetDirectory: string) => {
\tconst projectsCategories = [...templateProjectsCategories, ...hiddenTemplateProjectsCategories];
\tfor (const category of projectsCategories) {
\t\tconst card = category.cards.find((card) => card.assetDirectory === assetDirectory);
\t\tif (card) {
\t\t\treturn card.files;
\t\t}
\t}

\treturn undefined;
};`;
}

reconstructTemplateCategories().catch(console.error);
