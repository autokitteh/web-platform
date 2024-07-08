export enum SessionLogRecordType {
	callAttemptComplete = "callAttemptComplete",
	callAttemptStart = "callAttemptStart",
	callSpec = "callSpec",
	print = "print",
	state = "state",
	unknown = "unknown",
}
export enum SessionStateType {
	completed = "completed",
	created = "created",
	error = "error",
	running = "running",
	stopped = "stopped",
}

export enum SessionState {
	unspecified = 0,
	created = 1,
	running = 2,
	error = 3,
	completed = 4,
	stopped = 5,
}
