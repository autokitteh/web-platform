import { ActivityState } from "@src/constants";

export type ActivityStateType = (typeof ActivityState)[keyof typeof ActivityState];

export type SessionActivityChartRepresentation = {
	duration: string;
	endTime: string;
	fillColor: string;
	functionName: string;
	startTime: string;
	x: string;
	y: number[];
};
