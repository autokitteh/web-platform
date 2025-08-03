import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { DeepProtoValueResult } from "@src/interfaces/utilities";
import { ActivityStateType } from "@src/types";
import { AkDateTime } from "@src/types/global";
import { SessionActivityChartRepresentation } from "@src/types/models";
import { SessionStateKeyType } from "@src/types/models/sessionState.type";

export type { SessionStateKeyType };

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
	inputs: DeepProtoValueResult;
	memo: DeepProtoValueResult;
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
	returnValue?: DeepProtoValueResult;
	startTime?: AkDateTime;
	status: ActivityStateType;
	sequence?: number;
	duration?: string;
	chartRepresentation?: SessionActivityChartRepresentation;
}
