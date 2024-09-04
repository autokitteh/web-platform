import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { integrationTypes } from "@constants/lists";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { integrationToEditComponent } from "@src/constants";
import { Integrations } from "@src/enums/components";
import { connectionSchema } from "@validations";

import { Input } from "@components/atoms";
import { Select, TabFormHeader } from "@components/molecules";

export const EditConnection = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();
	const {
		connectionName,
		errors,
		fetchConnection,
		integration: selectedIntegration,
		register,
	} = useConnectionForm(connectionSchema, "edit");

	useEffect(() => {
		if (connectionId) {
			fetchConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	let googleIntegrationApplication;

	let integrationType = selectedIntegration?.value;
	if (selectedIntegration && selectedIntegration.value?.includes(Integrations.google)) {
		if (selectedIntegration?.value !== Integrations.google) {
			integrationType = selectedIntegration!.value.substring(Integrations.google.length);
			selectedIntegration!.value = integrationType;
			googleIntegrationApplication = integrationType;
		}
	}

	const SelectedIntegrationComponent = selectedIntegration
		? integrationToEditComponent[integrationType as keyof typeof Integrations]
		: null;

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" title={t("editConnection")} />

			<div className="mb-6 flex w-5/6 flex-col">
				<div className="relative mb-6">
					<Input
						aria-label={t("github.placeholders.name")}
						{...register("connectionName")}
						disabled
						isError={!!errors.connectionName}
						isRequired
						label={t("github.placeholders.name")}
						value={connectionName}
					/>
				</div>

				<Select
					aria-label={t("placeholders.selectIntegration")}
					disabled
					label={t("placeholders.integration")}
					options={integrationTypes}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>
			</div>

			<div className="w-5/6">
				{SelectedIntegrationComponent ? (
					<SelectedIntegrationComponent googleIntegrationApplication={googleIntegrationApplication} />
				) : null}
			</div>
		</div>
	);
};
