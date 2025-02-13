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
	completed = 4,
	created = 1,
	error = 3,
	running = 2,
	stopped = 5,
	unspecified = 0,
}

export enum ActivityState {
	completed = "completed",
	created = "created",
	error = "error",
	running = "running",
}

export enum SessionLogType {
	Output = "outputs",
	Activity = "activities",
	State = "states",
}
