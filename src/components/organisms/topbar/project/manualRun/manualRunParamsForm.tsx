import React, { useEffect, useState } from "react";

import Editor from "@monaco-editor/react";
import { Controller, FieldErrors, FieldValues, useFieldArray, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ManualRunJsonObject, ManualRunParam } from "@src/interfaces/components/forms";
import { useManualRunStore } from "@src/store";
import { ManualFormParamsErrors } from "@src/types/components";
import { safeJsonParse } from "@src/utilities";

import { Button, ErrorMessage, IconButton, Input, Loader, Toggle } from "@components/atoms";

import { PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const ManualRunParamsForm = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "history.manualRun" });
	const { t: tValidations } = useTranslation("validations", { keyPrefix: "manualRun" });
	const { clearErrors, control, formState, getValues, setError, setValue, trigger } = useFormContext();
	const { append, fields, remove } = useFieldArray({
		control,
		name: "params",
	});

	const triggerFormValidation = async () => {
		console.log(formState);

		const isValidForm = await trigger();
		if (isValidForm) {
			// This will update the form's overall validity state
			await trigger(["filePath", "entrypointFunction", "params"]);
			setValue("jsonParams", JSON.stringify(JSON.parse(getValues("params")), null, 2), { shouldValidate: true });
		}
	};

	// Add this useEffect at the component level, after your existing useEffect
	useEffect(() => {
		triggerFormValidation();
	}, []); // Empty dependency array means this runs once on mount

	const { projectId } = useParams();

	const { projectManualRun, updateManualRunConfiguration } = useManualRunStore((state) => ({
		projectManualRun: state.projectManualRun[projectId!],
		updateManualRunConfiguration: state.updateManualRunConfiguration,
	}));

	const { isJson } = projectManualRun || {};
	const [useJsonEditor, setUseJsonEditor] = useState(isJson);

	const convertParamsToJson = (currentParams: ManualRunParam[]) => {
		setValue("jsonParams", JSON.stringify(currentParams, null, 2), { shouldValidate: true });
	};

	useEffect(() => {
		if (isJson) {
			const currentParams = getValues("params");
			convertParamsToJson(currentParams);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const errors = formState.errors as FieldErrors<FieldValues> & ManualFormParamsErrors;

	const validateParams = () => {
		const params = getValues("params");
		let isValid = true;

		params.forEach((param: { key: string; value: string }, index: number) => {
			if (!param.key.trim()) {
				setError(`params.${index}.key`, {
					type: "manual",
					message: tValidations("keyIsRequired"),
				});
				isValid = false;
			}
			if (!param.value.trim()) {
				setError(`params.${index}.value`, {
					type: "manual",
					message: tValidations("valueIsRequired"),
				});
				isValid = false;
			}
		});

		return isValid;
	};

	const handleAddParam = () => {
		if (!fields.length || validateParams()) {
			append({ key: "", value: "" });
		}
	};

	const handleFieldChange = (index: number, field: "key" | "value", value: string) => {
		setValue(`params.${index}.${field}`, value, { shouldValidate: true });
		trigger(`params.${index}.${field}`);
	};

	const handleJsonToParamsConversion = () => {
		const jsonValue = getValues("jsonParams");
		if (!jsonValue) return;

		const parsedJson = safeJsonParse(jsonValue);
		if (!parsedJson) return;

		setValue("params", JSON.stringify(parsedJson, null, 2), { shouldValidate: true });
		clearErrors("jsonParams");
	};

	const handleParamsToJsonConversion = () => {
		const currentParams: ManualRunParam[] = getValues("params");
		const jsonObject = currentParams.reduce<ManualRunJsonObject>((acc, { key, value }) => {
			acc[key] = safeJsonParse(value) ?? value;

			return acc;
		}, {});

		const jsonString = JSON.stringify(jsonObject, null, 2);
		setValue("jsonParams", jsonString, { shouldValidate: true });
	};

	const toggleEditorMode = () => {
		const newJsonEditorState = !useJsonEditor;
		updateManualRunConfiguration(projectId!, { isJson: newJsonEditorState });
		setValue("isJson", newJsonEditorState, { shouldValidate: true });

		if (newJsonEditorState) {
			handleParamsToJsonConversion();
		} else {
			handleJsonToParamsConversion();
		}

		setUseJsonEditor(newJsonEditorState);
	};

	const handleJsonChange = (value?: string) => {
		try {
			if (!value) {
				return;
			}
			if (!safeJsonParse(value)) {
				setValue("jsonParams", value, { shouldValidate: true });
				return;
			}
			// Parse the string value from editor to object
			const jsonObject = value ? JSON.parse(value) : {};
			// Set the actual JSON object, not string
			setValue("jsonParams", JSON.stringify(jsonObject, null, 2), { shouldValidate: true });

			if (!value) {
				setValue("params", "", { shouldValidate: true });
				return;
			}

			setValue("params", JSON.stringify(jsonObject, null, 2), { shouldValidate: true });
		} catch (error) {
			// Handle invalid JSON
			console.error("Invalid JSON:", error);
		}
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
					name="jsonParams"
					render={({ field }) => (
						<div>
							<Editor
								className="min-h-96"
								defaultLanguage="json"
								loading={<Loader isCenter size="lg" />}
								onChange={(value) => handleJsonChange(value)}
								onMount={(editor) => {
									editor.onDidPaste(() => {
										handleJsonChange(editor.getValue());
									});
								}}
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
								theme="vs-dark"
								value={field.value}
							/>
							{errors.jsonParams ? <ErrorMessage>{errors.jsonParams.message}</ErrorMessage> : null}
						</div>
					)}
				/>
			) : (
				<>
					{fields.map((field, index) => (
						<div className="mb-6 flex items-end gap-3.5" key={field.id}>
							<Controller
								control={control}
								name={`params.${index}.key`}
								render={({ field }) => (
									<div className="w-1/2">
										<Input
											{...field}
											isError={!!errors?.params?.[index]?.key}
											isRequired
											label={t("placeholders.key")}
											onChange={(event) => handleFieldChange(index, "key", event.target.value)}
											placeholder={t("placeholders.enterKey")}
										/>
										{errors?.params?.[index]?.key ? (
											<ErrorMessage>{errors.params[index]?.key?.message}</ErrorMessage>
										) : null}
									</div>
								)}
							/>

							<Controller
								control={control}
								name={`params.${index}.value`}
								render={({ field }) => (
									<div className="w-1/2">
										<Input
											{...field}
											isError={!!errors?.params?.[index]?.value}
											isRequired
											label={t("placeholders.value")}
											onChange={(event) => handleFieldChange(index, "value", event.target.value)}
											placeholder={t("placeholders.enterValue")}
										/>
										{errors?.params?.[index]?.value ? (
											<ErrorMessage>{errors.params[index]?.value?.message}</ErrorMessage>
										) : null}
									</div>
								)}
							/>

							<IconButton
								ariaLabel={t("ariaDeleteParam")}
								className="self-center hover:bg-black"
								onClick={() => remove(index)}
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
