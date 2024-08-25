import { ActivityState } from "@enums";

export type Activity = {
	deploymentId: string;
	endTime: Date;
	key: string;
	parameters: string[];
	returnValue: object;
	startTime: Date;
	status: keyof ActivityState;
};
