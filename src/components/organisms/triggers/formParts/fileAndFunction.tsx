import React, { useState } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { featureFlags } from "@src/constants";
import { TriggerTypes } from "@src/enums";
import { SelectOption } from "@src/interfaces/components";
import { TriggerFormData } from "@validations";

import { ErrorMessage, Input } from "@components/atoms";
import { Select } from "@components/molecules";
import { SelectCreatable } from "@components/molecules/select";

export const TriggerSpecificFields = ({ filesNameList }: { filesNameList: SelectOption[] }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerFormData>();
	const connectionType = useWatch({ name: "connection.value" });
	const watchedFunctionName = useWatch({ control, name: "entryFunction" });
	const watchedEventType = useWatch({ control, name: "eventType" });
	const watchedFilter = useWatch({ control, name: "filter" });
	const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
	const [options, setOptions] = useState<SelectOption[]>([
		{ value: "option1", label: "Option 1" },
		{ value: "option2", label: "Option 2" },
		{ value: "option3", label: "Option 3", disabled: true },
	]);

	const handleCreateOption = (inputValue: string) => {
		const newOption: SelectOption = {
			value: inputValue,
			label: inputValue,
		};
		setOptions((prevOptions) => [...prevOptions, newOption]);
		setSelectedOption(newOption);
	};

	const handleSelectChange = (option: SelectOption | null) => {
		setSelectedOption(option);
	};

	return (
		<>
			<div className="relative">
				<Controller
					control={control}
					name="filePath"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("placeholders.selectFile")}
							dataTestid="select-file"
							isError={!!errors.filePath}
							label={t("placeholders.file")}
							noOptionsLabel={t("noFilesAvailable")}
							options={filesNameList}
							placeholder={t("placeholders.selectFile")}
						/>
					)}
				/>

				<ErrorMessage>{errors.filePath?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					aria-label={t("placeholders.functionName")}
					{...register("entryFunction")}
					isError={!!errors.entryFunction}
					label={t("placeholders.functionName")}
					value={watchedFunctionName}
				/>

				<ErrorMessage>{errors.entryFunction?.message as string}</ErrorMessage>
			</div>

			{connectionType !== TriggerTypes.webhook && connectionType !== TriggerTypes.schedule ? (
				<>
					<div className="relative">
						{featureFlags.displayComBoxTrigger ? (
							<SelectCreatable
								aria-label={t("placeholders.eventType")}
								dataTestid="select-creatable"
								disabled={false}
								isError={false}
								label={t("placeholders.eventType")}
								onChange={handleSelectChange}
								onCreateOption={handleCreateOption}
								options={options}
								placeholder={t("placeholders.eventType")}
								value={selectedOption}
							/>
						) : (
							<Input
								aria-label={t("placeholders.eventType")}
								{...register("eventType")}
								isError={!!errors.eventType}
								label={t("placeholders.eventType")}
								value={watchedEventType}
							/>
						)}

						<ErrorMessage>{errors.eventType?.message as string}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							aria-label={t("placeholders.filter")}
							{...register("filter")}
							isError={!!errors.filter}
							label={t("placeholders.filter")}
							value={watchedFilter}
						/>

						<ErrorMessage>{errors.filter?.message as string}</ErrorMessage>
					</div>
				</>
			) : null}
		</>
	);
};
