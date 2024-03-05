export type Session = {
	sessionId: string;
	deploymentId: string;
	state: number;
	createdAt: Date;
};

export type Callstack = {
	location: {
		col: number;
		row: number;
		name: string;
		path: string;
	};
};
