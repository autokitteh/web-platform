import React, { useEffect } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TriggerForm } from "@src/types/models";

import { ErrorMessage, Input } from "@components/atoms";
import { TimezoneSelect } from "@components/molecules";

export const SchedulerFields = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
		setValue,
	} = useFormContext<TriggerForm>();

	const cronValue = useWatch({ control, name: "cron" });

	useEffect(() => {
		if (cronValue) {
			setValue("cron", cronValue);
		}
	}, [cronValue, setValue]);

	return (
		<div className="flex flex-col gap-6">
			<div className="relative">
				<Input
					aria-label={t("placeholders.cron")}
					{...register("cron")}
					isError={!!errors.cron}
					isRequired
					label={t("placeholders.cron")}
					value={cronValue}
				/>

				{errors.cron?.message ? <ErrorMessage>{errors.cron.message}</ErrorMessage> : null}
			</div>

			<div className="relative">
				<Controller
					control={control}
					name="timezone"
					render={({ field: { onChange, value } }) => (
						<TimezoneSelect
							isError={!!errors.timezone}
							onChange={(selectedOption) => onChange(selectedOption?.value)}
							value={value}
						/>
					)}
				/>

				{errors.timezone?.message ? <ErrorMessage>{errors.timezone.message}</ErrorMessage> : null}
			</div>
		</div>
	);
};
