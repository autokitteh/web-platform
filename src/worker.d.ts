declare module "*.worker.js" {
	const WorkerConstructor: new () => Worker;

	export default WorkerConstructor;
}
