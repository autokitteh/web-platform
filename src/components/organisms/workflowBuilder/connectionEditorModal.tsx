import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Monaco } from "@monaco-editor/react";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useTranslation } from "react-i18next";
import { LuEye, LuEyeOff, LuPlus, LuTrash2 } from "react-icons/lu";

import { LegacyWorkflowEdgeData, WorkflowEdgeVariable } from "@interfaces/components/workflowBuilder.interface";
import { eventTypesPerIntegration } from "@src/constants/triggers";
import { ModalName } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { cn } from "@src/utilities";
import { useModalStore } from "@store/useModalStore";
import { useWorkflowBuilderStore } from "@store/useWorkflowBuilderStore";

import { Button, Input, Spinner, Typography } from "@components/atoms";
import { Modal } from "@components/molecules";
import { Select } from "@components/molecules/select";

const defaultCode = `def on_event(event):
    # Process data from the source integration
    # Use vars with: ak.get_var("key")
    return event
`;

export const ConnectionEditorModal = () => {
	const { t } = useTranslation("workflowBuilder");
	const { closeModal, getModalData } = useModalStore();
	const { edges, updateEdgeCode, updateEdgeEventType, updateEdgeVariables } = useWorkflowBuilderStore();

	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const [code, setCode] = useState<string>("");
	const [selectedEventType, setSelectedEventType] = useState<SelectOption | null>(null);
	const [variables, setVariables] = useState<WorkflowEdgeVariable[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<"code" | "vars">("code");

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
			const edgeData = edge?.data as LegacyWorkflowEdgeData | undefined;
			const existingCode = edgeData?.code || defaultCode;
			const existingEventType = edgeData?.eventType;
			const existingVars = edgeData?.variables || [];
			setCode(existingCode);
			setVariables(existingVars);
			if (existingEventType) {
				setSelectedEventType({ value: existingEventType, label: existingEventType });
			} else {
				setSelectedEventType(null);
			}
			setIsLoading(false);
		}
	}, [edgeId, edges]);

	const handleAddVariable = useCallback(() => {
		setVariables((prev) => [...prev, { key: "", value: "", isSecret: false }]);
	}, []);

	const handleRemoveVariable = useCallback((index: number) => {
		setVariables((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const handleVariableChange = useCallback(
		(index: number, field: keyof WorkflowEdgeVariable, value: string | boolean) => {
			setVariables((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
		},
		[]
	);

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
			const validVars = variables.filter((v) => v.key.trim().length > 0);
			updateEdgeVariables(edgeId, validVars);
		}
		disposeEditor();
		closeModal(ModalName.connectionCodeEditor);
	}, [
		edgeId,
		code,
		selectedEventType,
		variables,
		updateEdgeCode,
		updateEdgeEventType,
		updateEdgeVariables,
		disposeEditor,
		closeModal,
	]);

	const handleCancel = useCallback(() => {
		disposeEditor();
		closeModal(ModalName.connectionCodeEditor);
	}, [disposeEditor, closeModal]);

	return (
		<Modal
			className="flex h-[90vh] max-h-[90vh] min-h-[600px] w-full max-w-5xl flex-col"
			name={ModalName.connectionCodeEditor}
			variant="dark"
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

			<div className="mb-3 flex gap-2 border-b border-gray-700">
				<button
					className={cn(
						"px-4 py-2 text-sm font-medium transition-colors",
						activeTab === "code"
							? "border-b-2 border-green-500 text-green-500"
							: "text-gray-400 hover:text-white"
					)}
					onClick={() => setActiveTab("code")}
					type="button"
				>
					Code
				</button>
				<button
					className={cn(
						"flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors",
						activeTab === "vars"
							? "border-b-2 border-green-500 text-green-500"
							: "text-gray-400 hover:text-white"
					)}
					onClick={() => setActiveTab("vars")}
					type="button"
				>
					Variables
					{variables.length > 0 ? (
						<span className="ml-1 rounded-full bg-green-500/20 px-1.5 py-0.5 text-xs text-green-400">
							{variables.length}
						</span>
					) : null}
				</button>
			</div>

			{activeTab === "code" ? (
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
			) : (
				<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-700 p-4">
					<div className="mb-3 flex items-center justify-between">
						<Typography className="text-gray-300" element="span" size="small">
							Define variables that can be accessed in your code using ak.get_var(&quot;key&quot;)
						</Typography>
						<Button
							className="flex items-center gap-1 text-sm"
							onClick={handleAddVariable}
							variant="outline"
						>
							<LuPlus className="size-4" />
							Add Variable
						</Button>
					</div>

					<div className="flex-1 overflow-y-auto">
						{variables.length === 0 ? (
							<div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-600">
								<Typography className="text-gray-500" element="p" size="small">
									No variables defined. Click &quot;Add Variable&quot; to create one.
								</Typography>
							</div>
						) : (
							<div className="space-y-3">
								{variables.map((variable, index) => (
									<div
										className="flex items-start gap-3 rounded-lg border border-gray-700 bg-gray-900 p-3"
										key={index}
									>
										<div className="flex-1">
											<Input
												className="mb-2"
												onChange={(e) => handleVariableChange(index, "key", e.target.value)}
												placeholder="Variable name"
												value={variable.key}
											/>
											<div className="relative">
												<Input
													onChange={(e) =>
														handleVariableChange(index, "value", e.target.value)
													}
													placeholder="Value"
													type={variable.isSecret ? "password" : "text"}
													value={variable.value}
												/>
											</div>
										</div>
										<div className="flex flex-col gap-2">
											<button
												className={cn(
													"flex size-8 items-center justify-center rounded border transition-colors",
													variable.isSecret
														? "border-yellow-500 bg-yellow-500/20 text-yellow-500"
														: "border-gray-600 text-gray-400 hover:text-white"
												)}
												onClick={() =>
													handleVariableChange(index, "isSecret", !variable.isSecret)
												}
												title={variable.isSecret ? "Show value" : "Mark as secret"}
												type="button"
											>
												{variable.isSecret ? (
													<LuEyeOff className="size-4" />
												) : (
													<LuEye className="size-4" />
												)}
											</button>
											<button
												className="flex size-8 items-center justify-center rounded border border-red-500/50 text-red-400 transition-colors hover:bg-red-500/20"
												onClick={() => handleRemoveVariable(index)}
												title="Remove variable"
												type="button"
											>
												<LuTrash2 className="size-4" />
											</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

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
