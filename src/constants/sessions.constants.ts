export const sessionsEditorLineHeight = 20;
export const defaultSessionLogRecordsListRowHeight = 50;
export const defaultSessionsListRowHeight = 40;
export const maximumScreenHeightFallback = 2160;
export const defaultSessionTab = "outputs";
export const sessionTabs = [
	{ label: "Outputs", value: "outputs" },
	{ label: "Execution Flow", value: "executionflow" },
];

export const sessionLogRowHeight = Math.ceil(maximumScreenHeightFallback / defaultSessionLogRecordsListRowHeight) * 2;
export const sessionRowHeight = Math.ceil(maximumScreenHeightFallback / defaultSessionsListRowHeight) * 2;
