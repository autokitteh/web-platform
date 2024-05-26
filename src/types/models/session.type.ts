import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionStateType } from "@enums";

export type Session = {
	sessionId: string;
	deploymentId: string;
	state: number;
	createdAt: Date;
	inputs: object;
	entrypoint: EntrypointTrigger;
};

export type EntrypointTrigger = {
	symbol: string;
	location: SessionEntrypoint;
};

export type SessionEntrypoint = {
	col: number;
	row: number;
	name: string;
	path: string;
};

export type Callstack = {
	location: SessionEntrypoint;
};

export type SessionFilter = {
	stateType?: ProtoSessionStateType;
};

export type SessionStateKeyType = keyof typeof SessionStateType;
