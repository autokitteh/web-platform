import React, { useState } from "react";
import { Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { IntegrationGithubForm } from "@components/organisms/forms";
import { optionsSelectApp } from "@constants/lists";
import { ConnectionApp } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { useTranslation } from "react-i18next";

export const NewConnectionForm = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "connections.form" });
	const [selectedApp, setSelectedApp] = useState<SelectOption>();

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" title={t("addNewConnection")} />
			<div className="flex flex-col w-5/6 gap-6">
				<Select
					aria-label={t("placeholders.selectApp")}
					onChange={(option) => setSelectedApp(option as SelectOption)}
					options={optionsSelectApp}
					placeholder={t("placeholders.selectApp")}
					value={selectedApp}
				/>
				{selectedApp?.value === ConnectionApp.github ? <IntegrationGithubForm /> : null}
			</div>
		</div>
	);
};
