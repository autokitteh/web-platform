import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { ActivityState, SessionStateType } from "@enums";

export type Session = {
	connectionName?: string;
	createdAt: Date;
	deploymentId: string;
	entrypoint: EntrypointTrigger;
	inputs: object;
	sessionId: string;
	state: number;
};
export type ViewerSession = {
	buildId: string;
	connectionName?: string;
	createdAt: Date;
	entrypoint: SessionEntrypoint;
	eventId: string;
	eventType: string;
	inputs: object;
	sessionId: string;
	state: number;
	triggerName: string;
	updatedAt: Date;
};

export type EntrypointTrigger = {
	location: SessionEntrypoint;
	symbol: string;
};

export type SessionEntrypoint = {
	col: number;
	name: string;
	path: string;
	row: number;
};

export type Callstack = {
	location: SessionEntrypoint;
};

export type SessionFilter = {
	stateType?: ProtoSessionStateType;
};

export type SessionStateKeyType = keyof typeof SessionStateType;

export type SessionOutput = {
	isFinished: boolean;
	key: string;
	print: string;
	time: string;
};

export type SessionActivity = {
	args?: string[];
	endTime?: Date;
	functionName: string;
	key: string;
	kwargs?: { key: string; value: any }[];
	returnValue: string;
	startTime: Date;
	status: keyof ActivityState;
};
