import fs from "fs/promises";
import path from "path";

const CONSTANTS_FILE = "src/constants/dashboard.constants.ts";
const TEMPLATES_DIR = "src/assets/templates";

async function reconstructTemplateCategories() {
	console.log("Starting to reconstruct template categories...");

	const constantsContent = await fs.readFile(CONSTANTS_FILE, "utf-8");
	console.log("Successfully read the constants file.");

	const templateProjectsCategoriesMatch = constantsContent.match(
		/export const templateProjectsCategories:[^=]+=\s*(\[[\s\S]*?\n\];)/
	);
	if (!templateProjectsCategoriesMatch) {
		console.error("Could not find templateProjectsCategories in the file");

		return;
	}

	const templateProjectsCategoriesString = templateProjectsCategoriesMatch[1];
	console.log("Found templateProjectsCategories in the file.");

	const reconstructedCategories = await reconstructCategories(templateProjectsCategoriesString);

	const updatedContent = constantsContent.replace(
		/export const templateProjectsCategories:[^=]+=\s*(\[[\s\S]*?\n\];)/,
		`export const templateProjectsCategories: TemplateCategory[] = ${reconstructedCategories};`
	);

	await fs.writeFile(CONSTANTS_FILE, updatedContent, "utf-8");
	console.log("Template categories reconstructed and updated successfully!");
}

async function reconstructCategories(categoriesString: string): Promise<string> {
	const categories = [];
	let currentCategory = null;
	let currentCard = null;
	let accumulatingDescription = false;

	const lines = categoriesString.split("\n");
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();

		if (line.startsWith("name:")) {
			if (currentCategory) {
				categories.push(currentCategory);
			}
			currentCategory = { name: line.split(":")[1].trim().replace(/[",]/g, ""), cards: [] };
		} else if (line.startsWith("title:")) {
			if (currentCard) {
				currentCategory.cards.push(currentCard);
			}
			currentCard = { title: line.split(":")[1].trim().replace(/[",]/g, "") };
		} else if (currentCard) {
			if (line.startsWith("description:")) {
				accumulatingDescription = true;
				currentCard.description = line.split(":").slice(1).join(":").trim();
			} else if (accumulatingDescription) {
				if (line.startsWith("integrations:") || line.startsWith("assetDirectory:")) {
					accumulatingDescription = false;
				} else {
					currentCard.description += lines[i].trim();
				}
			}

			if (line.startsWith("integrations:")) {
				accumulatingDescription = false;
				const integrationsMatch = line.match(/integrations:\s*(\[[\s\S]*?\])/);
				if (integrationsMatch) {
					currentCard.integrations = integrationsMatch[1].replace(/\s+/g, " ");
				} else {
					currentCard.integrations = "[]";
				}
			} else if (line.startsWith("assetDirectory:")) {
				accumulatingDescription = false;
				currentCard.assetDirectory = line.split(":")[1].trim().replace(/[",]/g, "");
				currentCard.files = await getActualFiles(currentCard.assetDirectory);
			}
		}
	}

	if (currentCard) {
		currentCategory.cards.push(currentCard);
	}
	if (currentCategory) {
		categories.push(currentCategory);
	}

	return JSON.stringify(categories, null, 2).replace(/"integrations":\s*"\[(.*?)\]"/g, '"integrations": [$1]');
}

async function getActualFiles(assetDirectory: string): Promise<string[]> {
	const dirPath = path.join(TEMPLATES_DIR, assetDirectory);
	try {
		const files = await fs.readdir(dirPath);

		return files.filter((file) => !file.startsWith("."));
	} catch (error) {
		console.warn(`Error reading directory ${dirPath}:`, error);

		return [];
	}
}

reconstructTemplateCategories().catch(console.error);
