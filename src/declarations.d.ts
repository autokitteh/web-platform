declare module "monaco-editor/esm/vs/language/typescript/ts.worker?worker" {
	const workerFactory: () => Worker;
	export = workerFactory;
}

declare module "monaco-editor/esm/vs/editor/editor.worker?worker" {
	const workerFactory: () => Worker;
	export = workerFactory;
}
