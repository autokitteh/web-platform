import React, { useCallback, useState } from "react";

import Editor from "@monaco-editor/react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import {
	convertToJsonString,
	convertToKeyValuePairs,
} from "@src/components/organisms/topbar/project/manualRun/utilities";
import { ManualRunFormData } from "@src/interfaces/components";
import { useManualRunStore } from "@src/store";

import { Button, ErrorMessage, IconButton, Input, Loader, Toggle } from "@components/atoms";
import { Tooltip } from "@components/atoms/tooltip";

import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const ManualRunParamsForm = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const { control, formState, setValue } = useFormContext<ManualRunFormData>();

	const { projectId } = useParams();

	const errors = formState.errors;

	const { isJson, updateManualRunConfiguration } = useManualRunStore(
		useCallback(
			(state) => ({
				isJson: state.projectManualRun[projectId!]?.isJson,
				updateManualRunConfiguration: state.updateManualRunConfiguration,
			}),
			[projectId]
		)
	);

	const [useJsonEditor, setUseJsonEditor] = useState(isJson);
	const [jsonError, setJsonError] = useState(false);

	const [keyValuePairs, setKeyValuePairs] = useState(() =>
		convertToKeyValuePairs(control._formValues.params || "{}")
	);

	const handleJsonChange = useCallback(
		(value?: string) => {
			try {
				const newValue = typeof value === "string" ? value : "{}";
				const parsed = JSON.parse(newValue);
				const formatted = JSON.stringify(parsed, null, 2);

				setValue("params", formatted, { shouldValidate: true });
				setKeyValuePairs(convertToKeyValuePairs(formatted));
			} catch {
				setValue("params", value || "{}", { shouldValidate: true });
			}
		},
		[setValue]
	);

	const handleFieldChange = (index: number, field: "key" | "value", value: string) => {
		const newPairs = [...keyValuePairs];
		newPairs[index][field] = value;
		setKeyValuePairs(newPairs);
		setValue("params", convertToJsonString(newPairs), { shouldValidate: true });
	};

	const handleAddParam = () => {
		setKeyValuePairs([...keyValuePairs, { key: "", value: "" }]);
	};

	const handleRemoveParam = (index: number) => {
		const newPairs = keyValuePairs.filter((_, i) => i !== index);
		setKeyValuePairs(newPairs);
		setValue("params", convertToJsonString(newPairs), { shouldValidate: true });
	};

	const toggleEditorMode = () => {
		if (useJsonEditor) {
			try {
				const currentParams = control._formValues.params;
				JSON.parse(currentParams || "{}");
				setJsonError(false);
				const newJsonEditorState = !useJsonEditor;
				updateManualRunConfiguration(projectId!, { isJson: newJsonEditorState });
				setUseJsonEditor(newJsonEditorState);
			} catch {
				setJsonError(true);
				return;
			}
		} else {
			const newJsonEditorState = !useJsonEditor;
			updateManualRunConfiguration(projectId!, { isJson: newJsonEditorState });
			setUseJsonEditor(newJsonEditorState);
		}
	};

	return (
		<div className="mt-9 flex h-[calc(100vh-300px)] flex-col">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-1 text-base text-gray-500">{t("titleParams")}</div>
				<Tooltip content={jsonError ? t("invalidJsonFormat") : undefined} variant="error">
					<Toggle checked={useJsonEditor} label={t("useJsonEditor")} onChange={toggleEditorMode} />
				</Tooltip>
			</div>

			<div className="max-h-[calc(100vh-300px)] overflow-y-auto">
				{useJsonEditor ? (
					<Controller
						control={control}
						name="params"
						render={({ field }) => (
							<div>
								<Editor
									className="min-h-96"
									defaultLanguage="json"
									loading={<Loader isCenter size="lg" />}
									onChange={handleJsonChange}
									onMount={(editor) => {
										editor.onDidPaste(() => {
											handleJsonChange(editor.getValue());
										});
									}}
									options={{
										fontFamily: "monospace, sans-serif",
										fontSize: 14,
										minimap: { enabled: false },
										renderLineHighlight: "none",
										scrollBeyondLastLine: false,
										wordWrap: "on",
										formatOnPaste: true,
										formatOnType: true,
										autoClosingBrackets: "always",
										autoClosingQuotes: "always",
									}}
									theme="vs-dark"
									value={typeof field.value === "string" ? field.value : "{}"}
								/>
								{errors.params ? <ErrorMessage>{errors.params.message}</ErrorMessage> : null}
							</div>
						)}
					/>
				) : (
					<div className="flex h-full flex-col">
						<div className="flex-1 overflow-y-auto">
							<div className="mt-2 space-y-6">
								{keyValuePairs.map((pair, index) => (
									<div className="flex items-end gap-3.5" key={index}>
										<div className="w-1/2">
											<Input
												isRequired
												label={t("placeholders.key")}
												onChange={(event) =>
													handleFieldChange(index, "key", event.target.value)
												}
												placeholder={t("placeholders.enterKey")}
												value={pair.key}
											/>
										</div>
										<div className="w-1/2">
											<Input
												isRequired
												label={t("placeholders.value")}
												onChange={(event) =>
													handleFieldChange(index, "value", event.target.value)
												}
												placeholder={t("placeholders.enterValue")}
												value={pair.value}
											/>
										</div>
										<IconButton
											ariaLabel={t("ariaDeleteParam")}
											className="self-center hover:bg-black"
											onClick={() => handleRemoveParam(index)}
										>
											<TrashIcon className="size-5 stroke-white" />
										</IconButton>
									</div>
								))}
							</div>
						</div>
						<div className="mt-4">
							<Button
								className="group w-auto gap-1 p-0 font-semibold text-gray-500 hover:text-white"
								onClick={handleAddParam}
								type="button"
							>
								<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />
								{t("buttons.addNewParameter")}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
