import type * as Monaco from "monaco-editor";
import { wireTmGrammars } from "monaco-editor-textmate";
import { Registry, type IGrammarDefinition } from "monaco-textmate";
import { loadWASM } from "onigasm";

export const initPythonTextmate = async (
	monaco: typeof import("monaco-editor"),
	editor: Monaco.editor.IStandaloneCodeEditor
): Promise<void> => {
	const onigWasmUrl = "/onigasm.wasm";
	const wasm = await fetch(onigWasmUrl).then((r) => r.arrayBuffer());
	await loadWASM(wasm);

	const registry = new Registry({
		getGrammarDefinition: async (scopeName: string): Promise<IGrammarDefinition> => {
			if (scopeName === "source.python") {
				const content = await fetch("/grammars/python.tmLanguage.json").then((r) => r.text());
				return { format: "json", content } as IGrammarDefinition;
			}
			throw new Error(`Grammar not found for scope: ${scopeName}`);
		},
	});

	await wireTmGrammars(monaco, registry, new Map([["python", "source.python"]]), editor);
};
