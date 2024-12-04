export interface Connection {
	name: string;
	integration: string;
	vars?: Var[];
}

export interface Manifest {
	version: string;
	project?: Project;
}

export interface Project {
	name: string;
	connections?: Connection[];
	triggers?: Trigger[];
	vars?: Var[];
}

export interface Trigger {
	name: string;
	event_type?: string;
	filter?: string;
	type?: "schedule" | "webhook" | "connection";
	schedule?: string;
	webhook?: object;
	connection?: string;
	call?: string;
}

export interface Var {
	name: string;
	value: string;
	secret?: boolean;
}
