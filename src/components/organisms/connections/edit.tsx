import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { integrationTypes } from "@constants/lists";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { IntegrationType } from "@type/components";
import { connectionSchema } from "@validations";

import { Input, Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import {
	GithubIntegrationEditForm,
	GoogleIntegrationForm,
	SlackIntegrationAddForm,
} from "@components/organisms/connections/integrations";

export const EditConnection = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();

	const { errors, fetchConnection, register, setValue, watch } = useConnectionForm(
		{ connectionName: "", integration: {} },
		connectionSchema,
		"update"
	);

	useEffect(() => {
		if (connectionId) {
			fetchConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const selectedIntegration: SelectOption = watch("integration");

	const handleIntegrationChange = (option: SingleValue<SelectOption>): void => {
		setValue("integration", option as SelectOption);
	};

	const integrationComponents: Record<IntegrationType, JSX.Element> = {
		github: <GithubIntegrationEditForm />,
		google: <GoogleIntegrationForm />,
		slack: <SlackIntegrationAddForm triggerParentFormSubmit={() => {}} />,
	};

	const selectedIntegrationComponent = selectedIntegration
		? integrationComponents[selectedIntegration.value as IntegrationType]
		: null;

	const connectionName = watch("connectionName");

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" title={t("editConnection")} />

			<form className="mb-6 flex w-5/6 flex-col">
				<div className="relative mb-6">
					<Input
						aria-label={t("github.placeholders.name")}
						{...register("connectionName", { required: "Connection name is required" })}
						disabled
						isError={!!errors.connectionName}
						placeholder={t("github.placeholders.name")}
						value={connectionName}
					/>
				</div>

				<Select
					aria-label={t("placeholders.selectIntegration")}
					disabled
					onChange={handleIntegrationChange}
					options={integrationTypes}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>
			</form>

			<div className="w-5/6">{selectedIntegrationComponent}</div>
		</div>
	);
};
