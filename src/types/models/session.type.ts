import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionStateType } from "@enums";

export type Session = {
	createdAt: Date;
	deploymentId: string;
	entrypoint: EntrypointTrigger;
	inputs: object;
	sessionId: string;
	state: number;
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
