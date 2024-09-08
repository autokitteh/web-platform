import React, { useEffect } from "react";

import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TriggerFormData } from "@validations/newTrigger.schema";

import { ErrorMessage, Input } from "@components/atoms";

export const SchedulerFields = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
		setValue,
	} = useFormContext<TriggerFormData>();

	const cronValue = useWatch({ control, name: "cron" });

	useEffect(() => {
		if (cronValue) {
			setValue("cron", cronValue);
		}
	}, [cronValue, setValue]);

	return (
		<div className="relative">
			<Input
				aria-label={t("placeholders.cron")}
				{...register("cron")}
				isError={!!errors.cron}
				label={t("placeholders.cron")}
				value={cronValue || ""}
			/>

			<ErrorMessage>{errors.cron?.message as string}</ErrorMessage>
		</div>
	);
};
