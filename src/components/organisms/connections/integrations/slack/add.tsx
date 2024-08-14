import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationSlack } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { slackIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const SlackIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<SelectOption>();

	const { createConnection, errors, handleOAuth, isLoading, register } = useConnectionForm(
		{ appToken: "", botToken: "" },
		slackIntegrationSchema,
		"create"
	);

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
	};

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.slack]?.[selectedConnectionType?.value as ConnectionAuthType];

	const configureConnection = async (connectionId: string) => {
		switch (selectedConnectionType?.value) {
			case ConnectionAuthType.Socket:
				await createConnection(connectionId, ConnectionAuthType.Socket, Integrations.slack);
				break;
			case ConnectionAuthType.Oauth:
				await handleOAuth(connectionId, Integrations.github);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex items-start gap-10" onSubmit={triggerParentFormSubmit}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					label={t("placeholders.connectionType")}
					onChange={selectConnectionType}
					options={selectIntegrationSlack}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent errors={errors} isLoading={isLoading} mode="add" register={register} />
				) : null}
			</div>
		</form>
	);
};
