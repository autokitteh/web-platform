import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

import PythonWorker from "@src/monaco-workers/pyright.worker.js";

self.MonacoEnvironment = {
	getWorker(_: any, label: string) {
		if (label === "python") {
			return new (PythonWorker as any)();
		}

		return new (EditorWorker as any)();
	},
};
