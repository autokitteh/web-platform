export enum SessionLogRecordType {
	print = "print",
	unknown = "unknown",
	state = "state",
	callSpec = "callSpec",
	callAttemptStart = "callAttemptStart",
	callAttemptComplete = "callAttemptComplete",
}
export enum SessionStateType {
	created = "created",
	running = "running",
	stopped = "stopped",
	error = "error",
	completed = "completed",
}

export enum SessionState {
	UNSPECIFIED = 0,
	CREATED = 1,
	RUNNING = 2,
	ERROR = 3,
	COMPLETED = 4,
	STOPPED = 5,
}
