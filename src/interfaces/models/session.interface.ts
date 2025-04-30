import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionStateType } from "@enums";
import { ActivityStateType } from "@src/types";
import { AkDateTime } from "@src/types/global";
import { SessionActivityChartRepresentation } from "@src/types/models";

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

export interface SessionOutputLog {
	print: string;
	time: string;
}

export interface SessionActivity {
	args?: string[];
	endTime?: AkDateTime;
	functionName: string;
	key: string;
	kwargs?: { [key: string]: any };
	returnBytesValue?: string;
	returnJSONValue?: object;
	returnStringValue?: string;
	startTime?: AkDateTime;
	status: ActivityStateType;
	sequence?: number;
	duration?: string;
	chartRepresentation?: SessionActivityChartRepresentation;
}
