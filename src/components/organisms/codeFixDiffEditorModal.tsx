import React, { useCallback, useRef } from "react";

import { DiffEditor } from "@monaco-editor/react";
import type { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { CodeFixDiffEditorProps } from "@interfaces/components";

import { Button, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";

export const CodeFixDiffEditorModal: React.FC<CodeFixDiffEditorProps> = ({
	name,
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
		editor.focus();
	}, []);

	const handleApprove = useCallback(() => {
		onApprove();
	}, [onApprove]);

	const handleReject = useCallback(() => {
		onReject();
	}, [onReject]);

	const title = filename
		? `Code Fix Suggestion for ${filename}${startLine && endLine ? ` (lines ${startLine}-${endLine})` : ""}`
		: "Code Fix Suggestion";

	return (
		<Modal className="h-[600px] max-h-[90vh] w-full max-w-6xl bg-gray-900 text-white" hideCloseButton name={name}>
			<div className="mb-4 flex items-center justify-center">
				<Typography className="text-white" variant="h3">
					{title}
				</Typography>
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
						<Button className="px-6 text-white" onClick={handleReject} variant="outline">
							Reject
						</Button>
						<Button className="px-6" onClick={handleApprove} variant="filled">
							Apply Changes
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
};
