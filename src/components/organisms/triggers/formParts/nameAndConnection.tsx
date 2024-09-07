import React from "react";

import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SelectOption } from "@src/interfaces/components";
import { TriggerFormData } from "@validations/newTrigger.schema";

import { ErrorMessage, Input } from "@components/atoms";
import { Select } from "@components/molecules";

export const NameAndConnectionFields = ({ connections, isEdit }: { connections: SelectOption[]; isEdit?: boolean }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerFormData>();

	return (
		<>
			<div className="relative">
				<Input
					aria-label={t("placeholders.name")}
					{...register("name")}
					disabled={isEdit}
					isError={!!errors.name}
					label={t("placeholders.name")}
				/>

				<ErrorMessage>{String(errors.name?.message)}</ErrorMessage>
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
						/>
					)}
				/>

				<ErrorMessage>{String(errors.connection?.message)}</ErrorMessage>
			</div>
		</>
	);
};
