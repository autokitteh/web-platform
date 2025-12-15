import React from "react";

import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { AddConnectionProps, SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useHasActiveDeployments } from "@src/store";
import { getCustomAddForm, getIntegrationTypes, stripGoogleConnectionName } from "@src/utilities";
import { extractSettingsPath } from "@src/utilities/navigation";
import { connectionSchema } from "@validations";

import { useConnectionForm } from "@hooks";

import { ErrorMessage, Input } from "@components/atoms";
import { ActiveDeploymentWarning, Select, TabFormHeader } from "@components/molecules";

export const AddConnection = ({ onBack: onBackProp, isDrawerMode }: AddConnectionProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const { basePath } = extractSettingsPath(location.pathname);
	const handleBack = onBackProp || (() => navigate(`${basePath}/settings`));
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
	const SelectedIntegrationComponent = selectedIntegration ? getCustomAddForm(integrationType as Integrations) : null;

	const integrationTypes = getIntegrationTypes();

	const dataTestid = "select-integration";

	return (
		<div className="min-w-80">
			<TabFormHeader
				hideBackButton
				hideTitle={isDrawerMode}
				hideXbutton={isDrawerMode}
				isHiddenButtons
				isSaveButtonHidden
				onBack={handleBack}
				title={t("addNewConnection")}
			/>
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
					dataTestid={dataTestid}
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
