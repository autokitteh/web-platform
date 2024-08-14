import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationGoogle } from "@constants/lists";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { googleIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const GoogleIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	type,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
	type: string;
}) => {
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<SelectOption>();

	const { createConnection, errors, handleOAuth, isLoading, register, reset } = useConnectionForm(
		{ jsonKey: "" },
		googleIntegrationSchema,
		"create"
	);

	const selectConnectionType = (option?: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
	};

	useEffect(() => {
		selectConnectionType();
		reset({ jsonKey: "" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.google]?.[selectedConnectionType?.value as ConnectionAuthType];

	const configureConnection = async (connectionId: string) => {
		switch (selectedConnectionType?.value) {
			case ConnectionAuthType.Pat:
				await createConnection(connectionId, ConnectionAuthType.Pat, Integrations.github);
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
		<form className="flex w-full flex-col gap-6" onSubmit={triggerParentFormSubmit}>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				label={t("placeholders.connectionType")}
				noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
				onChange={selectConnectionType}
				options={selectIntegrationGoogle}
				placeholder={t("placeholders.selectConnectionType")}
				value={selectedConnectionType}
			/>

			{ConnectionTypeComponent ? (
				<ConnectionTypeComponent errors={errors} isLoading={isLoading} mode="create" register={register} />
			) : null}
		</form>
	);
};
