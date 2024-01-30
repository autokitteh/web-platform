export type LocalhostConnection = {
	isRunning: boolean;
	timer: IntervalTimer | undefined;
};

export type IntervalTimer = ReturnType<typeof setInterval>;
