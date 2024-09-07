import React from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SelectOption } from "@src/interfaces/components";
import { TriggerFormData } from "@validations";

import { ErrorMessage, Input } from "@components/atoms";
import { Select } from "@components/molecules";

export const NameAndConnectionFields = ({ connections, isEdit }: { connections: SelectOption[]; isEdit?: boolean }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerFormData>();

	const watchedName = useWatch({ control, name: "name" });
	const watchedConnection = useWatch({ control, name: "connection" });

	return (
		<>
			<div className="relative">
				<Input
					aria-label={t("placeholders.name")}
					{...register("name")}
					disabled={isEdit}
					isError={!!errors.name}
					label={t("placeholders.name")}
					value={watchedName}
				/>

				<ErrorMessage>{errors.name?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Controller
					control={control}
					name="connection"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("placeholders.selectConnection")}
							dataTestid="select-trigger-type"
							disabled={isEdit}
							isError={!!errors.connection}
							label={t("placeholders.connection")}
							noOptionsLabel={t("noConnectionsAvailable")}
							options={connections}
							placeholder={t("placeholders.selectConnection")}
							value={watchedConnection}
						/>
					)}
				/>

				<ErrorMessage>{errors.connection?.message as string}</ErrorMessage>
			</div>
		</>
	);
};
