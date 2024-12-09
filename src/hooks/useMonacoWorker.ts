import editorWorker from "monaco-editor/esm/vs/editor/editor.worker.js";

// eslint-disable-next-line @liferay/import-extensions
import pythonWorker from "../monaco-workers/pyright.worker.js";

self.MonacoEnvironment = {
	getWorker(_: any, label: string) {
		if (label === "python") {
			return new pythonWorker();
		}

		return new editorWorker();
	},
};
