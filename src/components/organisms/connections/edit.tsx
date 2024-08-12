import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { integrationTypes } from "@constants/lists";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { integrationToEditComponent } from "@src/constants";
import { Integrations } from "@src/enums/components";
import { connectionSchema } from "@validations";

import { Input, Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";

export const EditConnection = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();
	const { errors, fetchConnection, register, watch } = useConnectionForm(
		{ connectionName: "", integration: {} },
		connectionSchema,
		"edit"
	);

	useEffect(() => {
		if (connectionId) {
			fetchConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const selectedIntegration: SelectOption = watch("integration");

	const SelectedIntegrationComponent = selectedIntegration
		? integrationToEditComponent[selectedIntegration.value as keyof typeof Integrations]
		: null;

	const connectionName = watch("connectionName");

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" title={t("editConnection")} />

			<form className="mb-6 flex w-5/6 flex-col">
				<div className="relative mb-6">
					<Input
						aria-label={t("github.placeholders.name")}
						{...register("connectionName")}
						disabled
						isError={!!errors.connectionName}
						isRequired
						placeholder={t("github.placeholders.name")}
						value={connectionName}
					/>
				</div>

				<Select
					aria-label={t("placeholders.selectIntegration")}
					disabled
					options={integrationTypes}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>
			</form>

			<div className="w-5/6"> {SelectedIntegrationComponent ? <SelectedIntegrationComponent /> : null}</div>
		</div>
	);
};
