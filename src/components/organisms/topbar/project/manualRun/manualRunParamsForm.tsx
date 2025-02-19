import React, { useCallback, useState } from "react";

import Editor from "@monaco-editor/react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ManualRunFormData } from "@src/interfaces/components";
import { useManualRunStore } from "@src/store";
import { ManualRunJSONParameter } from "@src/types";
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
	} = useFormContext<ManualRunFormData>();

	const { projectId } = useParams();
	const [isJsonValid, setIsJsonValid] = useState(true);
	const [keyValuesError, setKeyValuesError] = useState<string[]>([]);
	const [duplicateKeyIndices, setDuplicateKeyIndices] = useState<number[]>([]);
	const [emptyKeyIndices, setEmptyKeyIndices] = useState<number[]>([]);
	const [emptyValueIndices, setEmptyValueIndices] = useState<number[]>([]);

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
			}
			setIsJsonValid(isValidJson);
			updateParams(value);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[setValue]
	);

	const hasEmptyPair = (newPairs: ManualRunJSONParameter[]) => {
		const emptyKeys = newPairs.reduce((acc, pair, index) => {
			if (!pair.key) {
				acc.push(index);
			}
			return acc;
		}, [] as number[]);
		setEmptyKeyIndices(emptyKeys);

		const emptyValues = newPairs.reduce((acc, pair, index) => {
			if (!pair.value) {
				acc.push(index);
			}
			return acc;
		}, [] as number[]);
		setEmptyValueIndices(emptyValues);

		return emptyKeys.length > 0 || emptyValues.length > 0;
	};

	const hasDuplicateKeys = (newPairs: ManualRunJSONParameter[]) => {
		const keys = newPairs.map((pair) => pair.key);
		const duplicateIndices = keys.reduce((acc, key, index) => {
			if (key && keys.indexOf(key) !== index) {
				acc.push(index);
				acc.push(keys.indexOf(key));
			}
			return acc;
		}, [] as number[]);
		setDuplicateKeyIndices(duplicateIndices);

		return duplicateIndices.length > 0;
	};

	const updateParams = (newParams: string) => {
		setValue("params", newParams);
		updateManualRunConfiguration(projectId!, { params: newParams });
	};

	const validateKeyValuesParams = (newPairs: ManualRunJSONParameter[], skipEmptyCheck?: boolean) => {
		const errors: string[] = [];

		const hasDuplicates = hasDuplicateKeys(newPairs);
		if (hasDuplicates) {
			errors.push(t("duplicateKeyError"));
		}

		if (!skipEmptyCheck) {
			const hasEmpty = hasEmptyPair(newPairs);
			if (hasEmpty) {
				errors.push(t("emptyKeyOrValueError"));
			}
		}

		setKeyValuesError(errors);
		return errors.length === 0;
	};

	const handleFieldChange = (index: number, field: "key" | "value", value: string) => {
		const newPairs = [...keyValuePairs];
		newPairs[index][field] = value;

		if (!validateKeyValuesParams(newPairs)) return;
		setKeyValuePairs(newPairs);
		updateParams(convertToJsonString(newPairs));
	};

	const handleAddParam = () => {
		if (!validateKeyValuesParams(keyValuePairs)) return;

		setKeyValuePairs([...keyValuePairs, { key: "", value: "" }]);
	};

	const handleRemoveParam = (index: number) => {
		if (!validateKeyValuesParams(keyValuePairs, true)) return;

		const newPairs = keyValuePairs.filter((_, i) => i !== index);
		setKeyValuePairs(newPairs);
		updateParams(convertToJsonString(newPairs));
	};

	const toggleEditorMode = () => {
		if (isJson && errors.params?.message) return;
		if (!isJson && keyValuesError.length > 0) return;

		const newJsonEditorState = !isJson;
		updateManualRunConfiguration(projectId!, { isJson: newJsonEditorState });
	};
	return (
		<div className="mt-9 flex h-[calc(100vh-300px)] flex-col">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-1 text-base text-gray-500">{t("titleParams")}</div>
				<Tooltip
					content={keyValuesError.join(", ") || t("invalidJsonFormat")}
					hide={!!(isJsonValid && keyValuesError.length === 0)}
					variant="error"
				>
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
								{!isJsonValid ? <ErrorMessage>{t("invalidJsonFormat")}</ErrorMessage> : null}
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
											isError={
												emptyKeyIndices.includes(index) || duplicateKeyIndices.includes(index)
											}
											isRequired
											label={t("placeholders.key")}
											onChange={(event) => handleFieldChange(index, "key", event.target.value)}
											placeholder={t("placeholders.enterKey")}
											value={pair.key}
										/>
									</div>
									<div className="w-1/2">
										<Input
											isError={emptyValueIndices.includes(index)}
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
						<div className="flex w-full">
							<Tooltip
								className="w-1/3"
								content={keyValuesError.join(", ")}
								hide={keyValuesError.length === 0}
								position="bottom"
								variant="error"
							>
								<Button
									className="group mt-4 w-full gap-1 p-0 font-semibold text-gray-500 hover:text-white"
									disabled={keyValuesError.length > 0}
									onClick={handleAddParam}
									type="button"
								>
									<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />
									{t("buttons.addNewParameter")}
								</Button>
							</Tooltip>
							<div className="mt-4 flex w-2/3 flex-col items-end">
								{keyValuesError.map((error, index) => (
									<ErrorMessage className="relative" key={index}>
										{error}
									</ErrorMessage>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
