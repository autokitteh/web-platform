import { ActivityState } from "@src/constants";

export type ActivityStateType = (typeof ActivityState)[keyof typeof ActivityState];

export type SessionActivityChartRepresentation = {
	fillColor: string;
	x: string;
	y: number[];
};
