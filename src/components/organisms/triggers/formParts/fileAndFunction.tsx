import React from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TriggerTypes } from "@src/enums";
import { SelectOption } from "@src/interfaces/components";
import { TriggerFormData } from "@validations/newTrigger.schema";

import { ErrorMessage, Input } from "@components/atoms";
import { Select } from "@components/molecules";

export const TriggerSpecificFields = ({ filesNameList }: { filesNameList: SelectOption[] }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerFormData>();
	const connectionType = useWatch({ name: "connection.value" });

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

				<ErrorMessage>{String(errors.filePath?.message)}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					aria-label={t("placeholders.functionName")}
					{...register("entryFunction")}
					isError={!!errors.entryFunction}
					label={t("placeholders.functionName")}
				/>

				<ErrorMessage>{String(errors.entryFunction?.message)}</ErrorMessage>
			</div>

			{connectionType === TriggerTypes.connection ? (
				<>
					<div className="relative">
						<Input
							aria-label={t("placeholders.eventType")}
							{...register("eventType")}
							isError={!!errors.eventType}
							label={t("placeholders.eventType")}
							name="eventType"
						/>

						<ErrorMessage>{String(errors.eventType?.message)}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							aria-label={t("placeholders.filter")}
							{...register("filter")}
							isError={!!errors.filter}
							label={t("placeholders.filter")}
							name="filter"
						/>

						<ErrorMessage>{String(errors.filter?.message)}</ErrorMessage>
					</div>
				</>
			) : null}
		</>
	);
};
