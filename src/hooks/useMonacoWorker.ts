import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

import PythonWorker from "@src/monaco-workers/pyright.worker?worker";

self.MonacoEnvironment = {
	getWorker(_: any, label: string): Worker {
		if (label === "typescript" || label === "javascript") {
			return new TsWorker();
		}
		if (label === "python") {
			return new PythonWorker();
		}

		return new EditorWorker();
	},
};
