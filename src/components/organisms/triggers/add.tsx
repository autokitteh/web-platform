import React, { useState } from "react";
import { Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { DefaultTriggerForm, TriggerSchedulerForm } from "@components/organisms/triggers";
import { defaultTriggerType } from "@constants";
import { selectTriggerType } from "@constants/lists/connections";
import { TriggerFormType, TriggerFormIds } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { useTranslation } from "react-i18next";

export const AddTrigger = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const [isSaving, setIsSaving] = useState(false);
	const [selectedType, setSelectedType] = useState<SelectOption>(defaultTriggerType);

	const formTriggerComponents = {
		[TriggerFormType.default]: (
			<DefaultTriggerForm formId={TriggerFormIds.createNewDefaultForm} setIsSaving={setIsSaving} />
		),
		[TriggerFormType.scheduler]: (
			<TriggerSchedulerForm formId={TriggerFormIds.createNewSchedulerForm} setIsSaving={setIsSaving} />
		),
	};

	const FormTriggerComponent = formTriggerComponents[selectedType.value as TriggerFormType];

	return (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form={FormTriggerComponent.props.formId}
				isLoading={isSaving}
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
				{FormTriggerComponent}
			</div>
		</div>
	);
};
