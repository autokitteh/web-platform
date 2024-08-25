import { ActivityState } from "@enums";

export type Activity = {
	endTime?: Date;
	functionName: string;
	key: string;
	parameters: Record<string, string> | undefined;
	returnValue: object;
	startTime: Date;
	status: keyof ActivityState;
};
