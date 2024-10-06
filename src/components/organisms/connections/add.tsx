import React from "react";

import { useTranslation } from "react-i18next";

import { integrationTypes } from "@constants/lists";
import { SelectOption } from "@interfaces/components";
import { integrationAddFormComponents } from "@src/constants/connections";
import { Integrations } from "@src/enums/components";
import { stripGoogleConnectionName } from "@src/utilities";
import { connectionSchema } from "@validations";

import { useConnectionForm } from "@hooks";

import { ErrorMessage, Input } from "@components/atoms";
import { Select, TabFormHeader } from "@components/molecules";

export const AddConnection = () => {
	const { t } = useTranslation("integrations");
	const { connectionId, errors, handleSubmit, onSubmit, register, setValue, watch } = useConnectionForm(
		connectionSchema,
		"create"
	);

	const selectedIntegration: SelectOption = watch("integration");

	const integrationType = stripGoogleConnectionName(selectedIntegration?.value) || selectedIntegration?.value;

	if (integrationType) {
		selectedIntegration!.value = integrationType;
	}
	const SelectedIntegrationComponent = selectedIntegration
		? integrationAddFormComponents[integrationType as keyof typeof Integrations]
		: null;

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" isHiddenButtons title={t("addNewConnection")} />

			<form className="mb-6 flex w-5/6 flex-col" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative mb-6">
					<Input
						aria-label={t("placeholders.name")}
						{...register("connectionName")}
						autoComplete="off"
						disabled={!!connectionId}
						isError={!!errors.connectionName}
						isRequired
						label={t("placeholders.name")}
					/>

					<ErrorMessage>{errors?.connectionName?.message as string}</ErrorMessage>
				</div>

				<Select
					aria-label={t("placeholders.selectIntegration")}
					dataTestid="select-integration"
					disabled={!!connectionId}
					label={t("placeholders.integration")}
					onChange={(selectedIntegration) => setValue("integration", selectedIntegration)}
					options={integrationTypes}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>
			</form>

			<div className="w-5/6">
				{SelectedIntegrationComponent ? (
					<SelectedIntegrationComponent
						connectionId={connectionId}
						triggerParentFormSubmit={handleSubmit(onSubmit)}
						type={selectedIntegration?.value}
					/>
				) : null}
			</div>
		</div>
	);
};
