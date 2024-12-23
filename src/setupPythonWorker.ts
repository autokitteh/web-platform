/* eslint-disable no-console */
/* eslint-disable @liferay/no-duplicate-imports */
/* eslint-disable import/order */
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018-2022 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { whenReady } from "@codingame/monaco-vscode-python-default-extension";
import * as monaco from "monaco-editor";
import { buildWorkerDefinition } from "monaco-editor-workers";
import { MonacoLanguageClient, initServices } from "monaco-languageclient";
import * as vscode from "vscode";
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import { Uri } from "vscode";
import { ExtensionHostKind, registerExtension } from "vscode/extensions";
import { createConfiguredEditor, createModelReference } from "vscode/monaco";
import { LogLevel } from "vscode/services";
import getConfigurationServiceOverride, {
	updateUserConfiguration,
} from "@codingame/monaco-vscode-configuration-service-override";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import { CloseAction, ErrorAction, MessageTransports } from "vscode-languageclient";
import { BrowserMessageReader, BrowserMessageWriter } from "vscode-languageserver-protocol/browser.js";
import * as JSZip from "jszip";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution";
import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution";
import "monaco-editor/esm/vs/basic-languages/css/css.contribution";
import "monaco-editor/esm/vs/basic-languages/html/html.contribution";
import "monaco-editor/esm/vs/basic-languages/shell/shell.contribution";
import "monaco-editor/esm/vs/basic-languages/xml/xml.contribution";
import "monaco-editor/esm/vs/language/typescript/monaco.contribution";
import "monaco-editor/esm/vs/language/json/monaco.contribution";
import "monaco-editor/esm/vs/language/css/monaco.contribution";
import "monaco-editor/esm/vs/language/html/monaco.contribution";
import "@codingame/monaco-vscode-yaml-default-extension";

// Add other language contributions as needed
buildWorkerDefinition("./monaco-editor-workers/dist/workers", new URL("", window.location.href).href, true);

const languageId = "python";
let languageClient: MonacoLanguageClient;

let files: { [id: string]: string } = {};

let editor: monaco.editor.IStandaloneCodeEditor;

// Add a variable to track if Python client is active
let isPythonClientActive = true;

/**
 * read file contents from zip file using jszip
 * @param url url of the zip file
 * @returns object with file path and file contents
 */
async function readZipFile(url: string) {
	try {
		const response = await fetch(url);
		const data = await response.arrayBuffer();
		const results: { [id: string]: string } = {};
		const zip = await JSZip.loadAsync(data);
		// eslint-disable-next-line prefer-const
		for (let [filename, file] of Object.entries(zip.files)) {
			// skip directories which suffixed with '/'
			if (filename.endsWith("/")) {
				// console.info(`Skip directory ${filename}`);
				continue;
			}
			// filename = filename.replace(/^stdlib/, '/workspace/typings');
			filename = filename.replace(/^(stdlib|stubs)/, "/$1");
			// filename = filename.replace(/^(stdlib|stubs)/, '/workspace/$1');
			// console.info(`Reading ${filename}`);
			results[filename] = await file.async("text");
		}
		console.info(`Read ${Object.keys(results).length} files`);

		// console.info(results);
		return results;
	} catch (error) {
		console.error(error);

		return {};
	}
}

const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
	return new MonacoLanguageClient({
		name: "Pyright Language Client",
		clientOptions: {
			// use a language id as a document selector
			documentSelector: [languageId],
			// disable the default error handler
			errorHandler: {
				error: () => ({ action: ErrorAction.Continue }),
				closed: () => ({ action: CloseAction.DoNotRestart }),
			},
			// pyright requires a workspace folder to be present, otherwise it will not work
			workspaceFolder: {
				index: 0,
				name: "/workspace",
				// uri: monaco.Uri.parse('/workspace')
				uri: Uri.file("/workspace"),
			},
			synchronize: {
				fileEvents: [vscode.workspace.createFileSystemWatcher("**")],
			},
			initializationOptions: {
				files,
			},
		},
		// create a language client connection from the JSON RPC connection on demand
		connectionProvider: {
			get: () => {
				return Promise.resolve(transports);
			},
		},
	});
};

export const startPythonClient = async (fileName: string) => {
	// read typeshed stdlib.zip file
	// files = await readZipFile(new URL('./stdlib.zip', window.location.href).href);
	console.log("readZipFile stdlib-source-with-typeshed-pyi.zip");
	files = await readZipFile(new URL("/stdlib-source-with-typeshed-pyi.zip", window.location.href).href);
	console.log("starting initServices ...");
	// init vscode-api

	const fileExtension = fileName.split(".")[1];

	await initServices({
		userServices: {
			...getThemeServiceOverride(),
			...getTextmateServiceOverride(),
			...getConfigurationServiceOverride(),
			...getKeybindingsServiceOverride(),
		},
		debugLogging: true,
		workspaceConfig: {
			workspaceProvider: {
				trusted: true,
				workspace: {
					workspaceUri: Uri.file("/workspace"),
				},
				async open() {
					return false;
				},
			},
			developmentOptions: {
				logLevel: LogLevel.Debug,
			},
		},
	});

	await whenReady();

	// extension configuration derived from:
	// https://github.com/microsoft/pyright/blob/main/packages/vscode-pyright/package.json
	// only a minimum is required to get pyright working
	const extension = {
		name: "python-client",
		publisher: "monaco-languageclient-project",
		version: "1.0.0",
		engines: {
			vscode: "^1.78.0",
		},
		contributes: {
			languages: [
				{
					id: languageId,
					aliases: ["Python"],
					extensions: [".py", ".pyi"],
				},
			],
			commands: [
				{
					command: "pyright.restartserver",
					title: "Pyright: Restart Server",
					category: "Pyright",
				},
				{
					command: "pyright.organizeimports",
					title: "Pyright: Organize Imports",
					category: "Pyright",
				},
			],
			keybindings: [
				{
					key: "ctrl+k",
					command: "pyright.restartserver",
					when: "editorTextFocus",
				},
			],
		},
	};
	registerExtension(extension, ExtensionHostKind.LocalProcess);

	updateUserConfiguration(`{
        "editor.fontSize": 14,
        "workbench.colorTheme": "Default Dark Modern"
    }`);

	const pythonWorkerUrl = new URL("/@typefox/pyright-browser/dist/pyright.worker.js", window.location.href).href;
	console.info(`main.ts, pythonWorkerUrl: ${pythonWorkerUrl}`);
	const worker = new Worker(pythonWorkerUrl);
	worker.postMessage({
		type: "browser/boot",
		mode: "foreground",
	});
	const reader = new BrowserMessageReader(worker);
	const writer = new BrowserMessageWriter(worker);
	languageClient = createLanguageClient({ reader, writer });
	languageClient.start();
	isPythonClientActive = true;
	reader.onClose(() => {
		languageClient.stop();
		isPythonClientActive = false;
	});

	const registerCommand = async (cmdName: string, handler: (...args: unknown[]) => void) => {
		// commands sould not be there, but it demonstrates how to retrieve list of all external commands
		const commands = await vscode.commands.getCommands(true);
		if (!commands.includes(cmdName)) {
			vscode.commands.registerCommand(cmdName, handler);
		}
	};
	// always exectute the command with current language client
	await registerCommand("pyright.restartserver", (...args: unknown[]) => {
		languageClient.sendRequest("workspace/executeCommand", { command: "pyright.restartserver", arguments: args });
	});
	await registerCommand("pyright.organizeimports", (...args: unknown[]) => {
		languageClient.sendRequest("workspace/executeCommand", { command: "pyright.organizeimports", arguments: args });
	});

	// use the file create before
	const modelRef = await createModelReference(monaco.Uri.file("/workspace/test.yaml"));
	modelRef.object.setLanguageId("yaml");

	// create monaco editor with more explicit configuration
	editor = createConfiguredEditor(document.getElementById("app")!, {
		model: modelRef.object.textEditorModel,
		automaticLayout: true,

		language: "python",
		// Add these additional editor options
		minimap: {
			enabled: true,
		},
		scrollBeyondLastLine: false,
		renderWhitespace: "none",
		wordWrap: "on",
	});

	// Add change event listener
	editor.onDidChangeModelContent(() => {
		const value = editor.getValue();
		// You can emit this change to a callback or handle it directly
		window.dispatchEvent(new CustomEvent("monacoEditorChange", { detail: value }));
	});
};

// Export the editor instance getter
export const getEditor = () => editor;

// Add a new function to update editor language
export const updateEditorLanguage = async (newLanguageId: string, fileName?: string) => {
	if (!editor) return;

	try {
		// Stop Python language client if switching to non-Python file
		if (newLanguageId !== "python" && isPythonClientActive) {
			languageClient?.stop();
			isPythonClientActive = false;
		} else if (newLanguageId === "python" && !isPythonClientActive) {
			// Restart Python language client if switching back to Python
			languageClient?.start();
			isPythonClientActive = true;
		}

		// Get current content
		const currentContent = editor.getValue();

		// Create a new model reference with the correct file path
		const modelRef = await createModelReference(monaco.Uri.file(`/workspace/${fileName || "untitled"}`));

		// Set the content and language
		modelRef.object.textEditorModel.setValue(currentContent);
		monaco.editor.setModelLanguage(modelRef.object.textEditorModel, newLanguageId);

		// Set the new model to the editor
		editor.setModel(modelRef.object.textEditorModel);
	} catch (error) {
		console.warn(`Failed to set language to ${newLanguageId}:`, error);
	}
};

// Register the YAML extension
const yamlExtension = {
	name: "yaml-client",
	publisher: "monaco-languageclient-project",
	version: "1.0.0",
	engines: {
		vscode: "^1.78.0",
	},
	contributes: {
		languages: [
			{
				id: "yaml",
				aliases: ["YAML"],
				extensions: [".yaml", ".yml"],
			},
		],
	},
};

registerExtension(yamlExtension, ExtensionHostKind.LocalProcess);
