import React from "react";

import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TriggerFormData } from "@validations/newTrigger.schema";

import { ErrorMessage, Input } from "@components/atoms";

export const SchedulerFields = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		formState: { errors },
		register,
	} = useFormContext<TriggerFormData>();

	return (
		<div className="relative">
			<Input
				aria-label={t("placeholders.cron")}
				{...register("cron")}
				isError={!!errors.cron}
				label={t("placeholders.cron")}
			/>

			<ErrorMessage>{String(errors.cron?.message)}</ErrorMessage>
		</div>
	);
};
