import React, { useCallback, useState } from "react";

import Editor from "@monaco-editor/react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ManualRunFormData } from "@src/interfaces/components";
import { useManualRunStore } from "@src/store";
import { convertToJsonString, convertToKeyValuePairs, safeJsonParse } from "@src/utilities";

import { Button, ErrorMessage, IconButton, Input, Loader, Toggle } from "@components/atoms";
import { Tooltip } from "@components/atoms/tooltip";

import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const ManualRunParamsForm = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const {
		control,
		formState: { errors },
		setValue,
		setError,
		clearErrors,
	} = useFormContext<ManualRunFormData>();

	const { projectId } = useParams();
	const [isJsonValid, setIsJsonValid] = useState(true);

	const { isJson, updateManualRunConfiguration } = useManualRunStore(
		useCallback(
			(state) => ({
				isJson: state.projectManualRun[projectId!]?.isJson,
				updateManualRunConfiguration: state.updateManualRunConfiguration,
			}),
			[projectId]
		)
	);

	const [keyValuePairs, setKeyValuePairs] = useState(() =>
		convertToKeyValuePairs(control._formValues.params || "{}")
	);

	const handleJsonChange = useCallback(
		(value?: string) => {
			if (!value) return;
			const isValidJson = safeJsonParse(value);
			if (isValidJson) {
				const parsed = JSON.parse(value);
				const formatted = JSON.stringify(parsed, null, 2);
				setKeyValuePairs(convertToKeyValuePairs(formatted));
				setIsJsonValid(true);
			} else {
				setIsJsonValid(false);
			}
			setValue("params", value, { shouldValidate: true });
			updateManualRunConfiguration(projectId!, { params: value });
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[setValue, setError, clearErrors]
	);

	const handleFieldChange = (index: number, field: "key" | "value", value: string) => {
		const newPairs = [...keyValuePairs];
		newPairs[index][field] = value;
		setKeyValuePairs(newPairs);
		setValue("params", convertToJsonString(newPairs));
	};

	const handleAddParam = () => {
		setKeyValuePairs([...keyValuePairs, { key: "", value: "" }]);
	};

	const handleRemoveParam = (index: number) => {
		const newPairs = keyValuePairs.filter((_, i) => i !== index);
		setKeyValuePairs(newPairs);
		setValue("params", convertToJsonString(newPairs));
	};

	const toggleEditorMode = () => {
		if (isJson) {
			if (errors.params?.message) {
				return;
			}
			const newJsonEditorState = !isJson;
			updateManualRunConfiguration(projectId!, { isJson: newJsonEditorState });
		}

		const newJsonEditorState = !isJson;
		updateManualRunConfiguration(projectId!, { isJson: newJsonEditorState });
	};

	return (
		<div className="mt-9 flex h-[calc(100vh-300px)] flex-col">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-1 text-base text-gray-500">{t("titleParams")}</div>
				<Tooltip content={t("invalidJsonFormat")} hide={isJsonValid} variant="error">
					<Toggle checked={isJson} label={t("useJsonEditor")} onChange={toggleEditorMode} />
				</Tooltip>
			</div>

			<div className="max-h-[calc(100vh-300px)] overflow-y-auto">
				{isJson ? (
					<Controller
						control={control}
						name="params"
						render={({ field }) => (
							<div>
								<Editor
									className="min-h-96"
									defaultLanguage="json"
									loading={<Loader isCenter size="lg" />}
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
									{...field}
									onChange={handleJsonChange}
								/>
								{!isJsonValid ? <ErrorMessage>{t("manualRun.invalidJsonFormat")}</ErrorMessage> : null}
							</div>
						)}
					/>
				) : (
					<div className="flex h-full flex-col">
						<div className="flex-1 space-y-6 overflow-y-auto pt-2">
							{keyValuePairs.map((pair, index) => (
								<div className="flex items-end gap-3.5" key={index}>
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
						</div>
						<Button
							className="group mt-4 w-auto gap-1 p-0 font-semibold text-gray-500 hover:text-white"
							onClick={handleAddParam}
							type="button"
						>
							<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />
							{t("buttons.addNewParameter")}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};
