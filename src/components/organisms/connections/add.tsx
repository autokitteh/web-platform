import React, { useState } from "react";
import { Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { GithubIntegrationForm } from "@components/organisms/connections/integrations";
import { selectConnectionApp } from "@constants/lists";
import { SelectOption } from "@interfaces/components";
import { IntegrationType } from "@type/components";
import { useTranslation } from "react-i18next";

export const AddConnection = () => {
	const { t } = useTranslation("integrations");
	const [selectedIntegration, setSelectedIntegration] = useState<SelectOption>();

	const integrationComponents: Record<IntegrationType, React.ReactNode> = {
		github: <GithubIntegrationForm />,
	};

	const selectedIntegrationComponent = selectedIntegration
		? integrationComponents[selectedIntegration.value as IntegrationType]
		: null;

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" title={t("addNewConnection")} />
			<div className="flex flex-col w-5/6 gap-6">
				<Select
					aria-label={t("placeholders.selectIntegration")}
					onChange={(option) => setSelectedIntegration(option as SelectOption)}
					options={selectConnectionApp}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>
				{selectedIntegrationComponent}
			</div>
		</div>
	);
};
