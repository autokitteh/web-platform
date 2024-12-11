declare module "*?worker" {
	const workerFactory: () => Worker;
	export = workerFactory;
}
