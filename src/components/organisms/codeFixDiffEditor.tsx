import React, { useCallback, useRef } from "react";

import { DiffEditor } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { Button, IconButton, Typography } from "@components/atoms";

import { Close } from "@assets/image/icons";

interface CodeFixDiffEditorProps {
	isOpen: boolean;
	onClose: () => void;
	originalCode: string;
	modifiedCode: string;
	onApprove: () => void;
	onReject: () => void;
	filename?: string;
	startLine?: number;
	endLine?: number;
}

export const CodeFixDiffEditor: React.FC<CodeFixDiffEditorProps> = ({
	isOpen,
	onClose,
	originalCode,
	modifiedCode,
	onApprove,
	onReject,
	filename,
	startLine,
	endLine,
}) => {
	const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

	const handleEditorWillMount = useCallback((monaco: Monaco) => {
		monaco.editor.defineTheme("codeFixDiffTheme", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#000000",
				"diffEditor.insertedTextBackground": "#00ff0020",
				"diffEditor.removedTextBackground": "#ff000020",
				"diffEditor.insertedLineBackground": "#00ff0010",
				"diffEditor.removedLineBackground": "#ff000010",
			},
		});
	}, []);

	const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneDiffEditor) => {
		diffEditorRef.current = editor;

		// Focus the diff editor
		editor.focus();
	}, []);

	const handleApprove = useCallback(() => {
		onApprove();
		onClose();
	}, [onApprove, onClose]);

	const handleReject = useCallback(() => {
		onReject();
		onClose();
	}, [onReject, onClose]);

	const title = filename
		? `Code Fix Suggestion for ${filename}${startLine && endLine ? ` (lines ${startLine}-${endLine})` : ""}`
		: "Code Fix Suggestion";

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
			<div className="relative h-[600px] max-h-[90vh] w-full max-w-6xl rounded-lg border border-gray-700 bg-gray-900 p-6">
				<div className="mb-4 flex items-center justify-between">
					<Typography className="text-white" variant="h3">
						{title}
					</Typography>
					<IconButton className="text-gray-400 hover:text-white" onClick={onClose} variant="ghost">
						<Close className="size-4" />
					</IconButton>
				</div>

				<div className="flex h-[calc(100%-120px)] flex-col">
					<div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-700">
						<DiffEditor
							beforeMount={handleEditorWillMount}
							height="100%"
							language="python"
							loading={
								<div className="flex h-full items-center justify-center">
									<Typography className="text-gray-400" variant="body2">
										Loading diff editor...
									</Typography>
								</div>
							}
							modified={modifiedCode}
							modifiedLanguage="python"
							onMount={handleEditorDidMount}
							options={{
								fontFamily: "monospace, sans-serif",
								fontSize: 14,
								minimap: {
									enabled: false,
								},
								renderLineHighlight: "none",
								scrollBeyondLastLine: false,
								wordWrap: "on",
							}}
							original={originalCode}
							originalLanguage="python"
							theme="vs-dark"
						/>
					</div>

					<div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
						<div className="flex items-center gap-2">
							<Typography className="text-gray-400" variant="body2">
								Review the suggested changes above.
							</Typography>
						</div>

						<div className="flex items-center gap-3">
							<Button className="px-6" onClick={handleReject} variant="outline">
								Reject
							</Button>
							<Button className="px-6" onClick={handleApprove} variant="filled">
								Apply Changes
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
