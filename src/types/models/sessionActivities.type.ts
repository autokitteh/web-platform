import { ActivityState } from "@enums";

export type Activity = {
	args?: string[];
	endTime?: Date;
	functionName: string;
	key: string;
	kwargs?: { key: string; value: any }[];
	returnValue: object;
	startTime: Date;
	status: keyof ActivityState;
};
