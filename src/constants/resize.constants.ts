import { calculateOptimalSplitFrameWidth } from "@utilities/fileTree.utils";

export const defaultSystemLogSize = {
	initial: 0,
	max: 100,
	min: 0,
};

export const defaultSplitFrameSize = {
	max: 70,
	min: 15,
	initial: 30,
};

/**
 * Creates a dynamic split frame size configuration based on file names
 * @param filePaths - Array of file paths to calculate optimal width from
 * @returns Split frame size configuration with calculated initial width
 */
export const createDynamicSplitFrameSize = (filePaths: string[]) => {
	return {
		max: 70,
		min: 15,
		initial: calculateOptimalSplitFrameWidth(filePaths, 35, 15),
	};
};

export const defaultChatbotWidth = {
	max: 80,
	min: 20,
	initial: 45,
};

export const defaultProjectSettingsWidth = {
	max: 80,
	min: 20,
	initial: 20,
};

export const defaultSessionsTableSplit = {
	max: 80,
	min: 22,
	initial: 35,
};
