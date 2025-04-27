import React from "react";

import { useTranslation } from "react-i18next";

import { integrationAddFormComponents } from "@constants/connections";
import { integrationTypes } from "@constants/lists";
import { Integrations } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { stripGoogleConnectionName } from "@utilities";
import { connectionSchema } from "@validations";

import { useConnectionForm } from "@hooks";
import { useHasActiveDeployments } from "@store";

import { ErrorMessage, Input } from "@components/atoms";
import { ActiveDeploymentWarning, Select, TabFormHeader } from "@components/molecules";

export const AddConnection = () => {
	const { t } = useTranslation("integrations");
	const { connectionId, errors, handleSubmit, onSubmit, register, setValue, watch, isLoading } = useConnectionForm(
		connectionSchema,
		"create"
	);
	const hasActiveDeployments = useHasActiveDeployments();

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
			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

			<form className="mb-6 flex w-5/6 flex-col" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative mb-6">
					<Input
						aria-label={t("placeholders.name")}
						{...register("connectionName")}
						disabled={!!connectionId || isLoading}
						isError={!!errors.connectionName}
						isRequired
						label={t("placeholders.name")}
					/>

					<ErrorMessage>{errors?.connectionName?.message as string}</ErrorMessage>
				</div>

				<Select
					aria-label={t("placeholders.selectIntegration")}
					dataTestid="select-integration"
					disabled={!!connectionId || isLoading}
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
