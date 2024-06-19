import React, { useState } from "react";
import { Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { DefaultTriggerForm, TriggerSchedulerForm } from "@components/organisms/triggers";
import { selectTriggerType } from "@constants/lists/connections";
import { TriggerFormType } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { useTranslation } from "react-i18next";

export const AddTrigger = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const [isLoading, setIsLoading] = useState(false);
	const [selectedType, setSelectedType] = useState<SelectOption>(selectTriggerType[0]);

	return (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form={selectedType?.value === TriggerFormType.default ? "createNewDefaultForm" : "createNewSchedulerForm"}
				isLoading={isLoading}
				title={t("addNewTrigger")}
			/>
			<div className="flex flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectTriggerType")}
					onChange={(option) => setSelectedType(option as SelectOption)}
					options={selectTriggerType}
					placeholder={t("placeholders.selectTriggerType")}
					value={selectedType}
				/>
				{selectedType?.value === TriggerFormType.default ? (
					<DefaultTriggerForm formId="createNewDefaultForm" setIsSaving={setIsLoading} />
				) : null}
				{selectedType?.value === TriggerFormType.scheduler ? (
					<TriggerSchedulerForm formId="createNewSchedulerForm" setIsSaving={setIsLoading} />
				) : null}
			</div>
		</div>
	);
};
