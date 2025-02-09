import React, { useCallback, useState } from "react";

import Editor from "@monaco-editor/react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ManualRunFormData } from "@src/interfaces/components";
import { useManualRunStore } from "@src/store";
import { safeJsonParse } from "@src/utilities";

import { Button, ErrorMessage, IconButton, Input, Loader, Toggle } from "@components/atoms";

import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

const convertToKeyValuePairs = (jsonString: string) => {
	try {
		const parsed = JSON.parse(jsonString);
		return Object.entries(parsed).map(([key, value]) => ({
			key,
			value: typeof value === "string" ? value : JSON.stringify(value),
		}));
	} catch {
		return [];
	}
};

const convertToJsonString = (pairs: Array<{ key: string; value: string }>) => {
	const object = pairs.reduce<Record<string, unknown>>((acc, { key, value }) => {
		if (!key.trim()) return acc;
		acc[key] = safeJsonParse(value) ?? value;
		return acc;
	}, {});
	return JSON.stringify(object, null, 2);
};

export const ManualRunParamsForm = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const { control, formState, setValue } = useFormContext<ManualRunFormData>();

	const { projectId } = useParams();
	const { projectManualRun, updateManualRunConfiguration } = useManualRunStore((state) => ({
		projectManualRun: state.projectManualRun[projectId!],
		updateManualRunConfiguration: state.updateManualRunConfiguration,
	}));

	const { isJson } = projectManualRun || {};
	const [useJsonEditor, setUseJsonEditor] = useState(isJson);
	const [keyValuePairs, setKeyValuePairs] = useState<Array<{ key: string; value: string }>>(() =>
		convertToKeyValuePairs(control._formValues.params || "{}")
	);

	const errors = formState.errors;
	const handleJsonChange = useCallback(
		(value?: string) => {
			try {
				// Always work with a string
				const newValue = typeof value === "string" ? value : "{}";

				// Try to parse and format the JSON
				const parsed = JSON.parse(newValue);
				const formatted = JSON.stringify(parsed, null, 2);

				// Update form value
				setValue("params", formatted, { shouldValidate: true });

				// Update key-value pairs
				setKeyValuePairs(convertToKeyValuePairs(formatted));
			} catch {
				// If JSON is invalid, just update the raw value
				setValue("params", typeof value === "string" ? value : "{}", { shouldValidate: true });
			}
		},
		[setValue, setKeyValuePairs]
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
		const newJsonEditorState = !useJsonEditor;
		updateManualRunConfiguration(projectId!, { isJson: newJsonEditorState });
		setUseJsonEditor(newJsonEditorState);
	};

	return (
		<div className="mt-9">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-1 text-base text-gray-500">{t("titleParams")}</div>
				<Toggle checked={useJsonEditor} label={t("useJsonEditor")} onChange={toggleEditorMode} />
			</div>

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
				<>
					{keyValuePairs.map((pair, index) => (
						<div className="mb-6 flex items-end gap-3.5" key={index}>
							<div className="w-1/2">
								<Input
									isRequired
									label={t("placeholders.key")}
									onChange={(event) => handleFieldChange(index, "key", event.target.value)}
									placeholder={t("placeholders.enterKey")}
									value={pair.key}
								/>
							</div>
							<div className="w-1/2">
								<Input
									isRequired
									label={t("placeholders.value")}
									onChange={(event) => handleFieldChange(index, "value", event.target.value)}
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
					<Button
						className="group mt-5 w-auto gap-1 p-0 font-semibold text-gray-500 hover:text-white"
						onClick={handleAddParam}
						type="button"
					>
						<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />
						{t("buttons.addNewParameter")}
					</Button>
				</>
			)}
		</div>
	);
};
