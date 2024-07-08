import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { integrationTypes } from "@constants/lists";
import { SelectOption } from "@interfaces/components";
import { IntegrationType } from "@type/components";

import { Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { GithubIntegrationForm, GoogleIntegrationForm } from "@components/organisms/connections/integrations";

export const AddConnection = () => {
	const { t } = useTranslation("integrations");
	const [selectedIntegration, setSelectedIntegration] = useState<SelectOption>();

	const integrationComponents: Record<IntegrationType, React.ReactNode> = {
		github: <GithubIntegrationForm />,
		google: <GoogleIntegrationForm />,
	};

	const selectedIntegrationComponent = selectedIntegration ? integrationComponents[selectedIntegration.value as IntegrationType] : null;

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" title={t("addNewConnection")} />

			<div className="flex w-5/6 flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectIntegration")}
					noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
					onChange={(option) => setSelectedIntegration(option as SelectOption)}
					options={integrationTypes}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>

				{selectedIntegrationComponent}
			</div>
		</div>
	);
};
