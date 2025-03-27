export const sessionsEditorLineHeight = 20;
export const defaultSessionLogRecordsListRowHeight = 50;
export const defaultSessionsListRowHeight = 40;
export const defaultSessionsPageSize = 50;
export const standardScreenHeightFallback = 1400;
export const defaultSessionTab = "outputs";
export const sessionTabs = [
	{ label: "Outputs", value: "outputs" },
	{ label: "Execution Flow", value: "executionflow" },
];

export const sessionLogRowHeight = Math.ceil(
	(standardScreenHeightFallback / defaultSessionLogRecordsListRowHeight) * 1.5
);
