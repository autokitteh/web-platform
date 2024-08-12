import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { defaultTriggerType } from "@constants";
import { triggerTypes } from "@constants/lists/connections";
import { TriggerFormIds, TriggerFormType } from "@enums/components";
import { SelectOption } from "@interfaces/components";

import { Select, TabFormHeader } from "@components/molecules";
import { DefaultTriggerForm, TriggerSchedulerForm } from "@components/organisms/triggers";

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
				className="mb-10"
				form={FormTriggerComponent.props.formId}
				isLoading={isSaving}
				title={t("addNewTrigger")}
			/>

			<div className="flex flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectTriggerType")}
					dataTestid="select-trigger-type"
					noOptionsLabel={t("placeholders.noTriggerTypesAvailable")}
					onChange={(option) => setSelectedType(option as SelectOption)}
					options={triggerTypes}
					placeholder={t("placeholders.selectTriggerType")}
					value={selectedType}
				/>

				{FormTriggerComponent}
			</div>
		</div>
	);
};
