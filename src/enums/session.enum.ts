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
	unspecified = 0,
	created = 1,
	running = 2,
	error = 3,
	completed = 4,
	stopped = 5,
}
