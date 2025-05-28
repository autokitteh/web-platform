import { SourceType } from "@enums";

export const defaultEventsTableRowHeight = 40;
export const maxResultsLimitToDisplay = 50;

export const eventSourseTypes = [
	{
		label: SourceType.connections,
		value: "connections",
	},
	{
		label: SourceType.triggers,
		value: "triggers",
	},
];
