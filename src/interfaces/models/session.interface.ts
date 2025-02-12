import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { ActivityState, SessionStateType } from "@enums";

export interface SessionEntrypoint {
	col: number;
	name: string;
	path: string;
	row: number;
}

export interface EntrypointTrigger extends SessionEntrypoint {
	symbol: string;
}
export interface BuildRuntimeExport extends SessionEntrypoint {
	symbol: string;
	location: SessionEntrypoint;
}

interface BaseSession {
	createdAt: Date;
	inputs: object;
	sessionId: string;
	state: number;
	triggerName?: string;
}

export interface Session extends BaseSession {
	connectionName?: string;
	deploymentId: string;
	entrypoint: EntrypointTrigger;
}

export interface ViewerSession extends BaseSession {
	buildId: string;
	entrypoint: SessionEntrypoint;
	eventId: string;
	sourceType?: string;
	updatedAt: Date;
}

export interface Callstack {
	location: SessionEntrypoint;
}

export interface SessionFilter {
	stateType?: ProtoSessionStateType;
}

export type SessionStateKeyType = keyof typeof SessionStateType;

export interface SessionOutput {
	isFinished: boolean;
	key: string;
	print: string;
	time: string;
}

export interface SessionOutputLog {
	print: string;
	time: string;
}

export interface SessionActivity {
	args?: string[];
	endTime?: Date;
	functionName: string;
	key: string;
	kwargs?: { key: string; value: any };
	returnBytesValue?: string;
	returnJSONValue?: object;
	returnStringValue?: string;
	startTime: Date;
	status: keyof ActivityState;
}
