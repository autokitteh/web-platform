import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Monaco } from "@monaco-editor/react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";

import { eventTypesPerIntegration } from "@src/constants/triggers";
import { ModalName } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Button, Spinner, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";
import { Select } from "@components/molecules/select";

const defaultCode = `# Define the connection logic between integrations
# This code will be executed when data flows through this connection

def on_connection(source_data):
    """
    Process data from the source integration.

    Args:
        source_data: Data received from the source integration

    Returns:
        Processed data to send to the target integration
    """
    # Transform or process the data as needed
    return source_data
`;

export const ConnectionEditorModal = () => {
	const { t } = useTranslation("workflowBuilder");
	const { closeModal, getModalData } = useModalStore();
	const { edges, updateEdgeCode, updateEdgeEventType } = useWorkflowBuilderStore();

	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const [code, setCode] = useState<string>("");
	const [selectedEventType, setSelectedEventType] = useState<SelectOption | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const modalData = getModalData<{ edgeId: string; sourceIntegration?: Integrations }>(
		ModalName.connectionCodeEditor
	);
	const edgeId = modalData?.edgeId;
	const sourceIntegration = modalData?.sourceIntegration;

	const eventTypeOptions = useMemo(() => {
		if (!sourceIntegration) return [];
		const integrationKey = sourceIntegration.toLowerCase() as keyof typeof eventTypesPerIntegration;
		const eventTypes = eventTypesPerIntegration[integrationKey] || [];
		return eventTypes.map((eventType) => ({
			value: eventType,
			label: eventType,
		}));
	}, [sourceIntegration]);

	useEffect(() => {
		if (edgeId) {
			const edge = edges.find((e) => e.id === edgeId);
			const existingCode = edge?.data?.code || defaultCode;
			const existingEventType = edge?.data?.eventType;
			setCode(existingCode);
			if (existingEventType) {
				setSelectedEventType({ value: existingEventType, label: existingEventType });
			} else {
				setSelectedEventType(null);
			}
			setIsLoading(false);
		}
	}, [edgeId, edges]);

	const disposeEditor = useCallback(() => {
		if (editorRef.current) {
			try {
				editorRef.current.dispose();
			} catch {
				// Ignore disposal errors
			}
			editorRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => {
			disposeEditor();
		};
	}, [disposeEditor]);

	const handleEditorWillMount = useCallback((monacoInstance: Monaco) => {
		monacoInstance.editor.defineTheme("connectionEditorTheme", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#0a0a0a",
			},
		});
	}, []);

	const handleEditorDidMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
		editorRef.current = editor;
		editor.focus();
	}, []);

	const handleEditorChange = useCallback((value: string | undefined) => {
		setCode(value || "");
	}, []);

	const handleSave = useCallback(() => {
		if (edgeId) {
			updateEdgeCode(edgeId, code);
			if (selectedEventType) {
				updateEdgeEventType(edgeId, selectedEventType.value as string);
			}
		}
		disposeEditor();
		closeModal(ModalName.connectionCodeEditor);
	}, [edgeId, code, selectedEventType, updateEdgeCode, updateEdgeEventType, disposeEditor, closeModal]);

	const handleCancel = useCallback(() => {
		disposeEditor();
		closeModal(ModalName.connectionCodeEditor);
	}, [disposeEditor, closeModal]);

	return (
		<Modal
			className="flex h-[90vh] max-h-[90vh] min-h-[600px] w-full max-w-5xl flex-col bg-gray-950 text-white"
			name={ModalName.connectionCodeEditor}
		>
			<div className="mb-4 flex items-center justify-between border-b border-gray-700 pb-4">
				<div>
					<Typography className="text-white" variant="h3">
						{t("modal.title")}
					</Typography>
					<Typography className="mt-1 text-gray-400" element="p" size="small">
						{t("modal.description")}
					</Typography>
				</div>
			</div>

			{eventTypeOptions.length > 0 ? (
				<div className="mb-4">
					<Select
						dataTestid="select-event-type"
						isClearable
						label={t("modal.eventType")}
						noOptionsLabel={t("modal.noEventTypes")}
						onChange={(option) => setSelectedEventType(option as SelectOption | null)}
						options={eventTypeOptions}
						placeholder={t("modal.selectEventType")}
						value={selectedEventType}
					/>
				</div>
			) : null}

			<div className="relative h-[30vh] min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-700">
				{isLoading ? (
					<div className="flex h-full items-center justify-center">
						<Spinner />
					</div>
				) : (
					<Editor
						beforeMount={handleEditorWillMount}
						height="100%"
						language="python"
						loading={
							<div className="flex h-[30vh] items-center justify-center">
								<Spinner />
							</div>
						}
						onChange={handleEditorChange}
						onMount={handleEditorDidMount}
						options={{
							fontFamily: "monospace, sans-serif",
							fontSize: 14,
							minimap: { enabled: true },
							renderLineHighlight: "line",
							scrollBeyondLastLine: false,
							wordWrap: "on",
							automaticLayout: true,
							padding: { top: 16, bottom: 16 },
							lineNumbers: "on",
							folding: true,
							bracketPairColorization: { enabled: true },
						}}
						theme="connectionEditorTheme"
						value={code}
					/>
				)}
			</div>

			<div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
				<Typography className="text-gray-400" element="p" size="small">
					{t("modal.hint")}
				</Typography>

				<div className="flex items-center gap-3">
					<Button className="px-6 text-white" onClick={handleCancel} variant="outline">
						{t("modal.cancel")}
					</Button>
					<Button className="px-6" onClick={handleSave} variant="filled">
						{t("modal.save")}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
