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
