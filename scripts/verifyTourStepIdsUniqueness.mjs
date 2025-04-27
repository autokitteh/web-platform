/* eslint-disable @typescript-eslint/naming-convention */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function verifyTourStepIdsUniqueness() {
	try {
		const tourConstantsPath = path.resolve(__dirname, "../src/constants/tour.constants.ts");
		const fileContent = fs.readFileSync(tourConstantsPath, "utf8");

		const tourStepsMatch = fileContent.match(/export const tourSteps = ({[\s\S]*?}) as const;/);

		if (!tourStepsMatch) {
			throw new Error("Could not find tourSteps object in tour.constants.ts");
		}

		const tourStepsString = tourStepsMatch[1];

		const stepIdRegex = /"([^"]+)"/g;
		const allIds = new Set();
		const duplicates = [];

		let match;
		while ((match = stepIdRegex.exec(tourStepsString)) !== null) {
			const id = match[1];
			if (allIds.has(id)) {
				duplicates.push(id);
			} else {
				allIds.add(id);
			}
		}

		if (duplicates.length > 0) {
			throw new Error(`[Tour] Found duplicate step IDs: ${duplicates.join(", ")}`);
		}

		// eslint-disable-next-line no-console
		console.log("Tour step IDs uniqueness verified successfully");
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error("Error verifying tour step IDs:", error);
		// eslint-disable-next-line no-undef
		process.exit(1);
	}
}

verifyTourStepIdsUniqueness();
