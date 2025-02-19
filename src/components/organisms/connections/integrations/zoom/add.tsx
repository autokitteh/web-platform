import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@src/constants";
import { zoomIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { SelectOption } from "@src/interfaces/components";
import { zoomPrivateAuthIntegrationSchema, oauthSchema, zoomPrivateToServerIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const ZoomIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");
	const {
		control,
		copyToClipboard,
		errors,
		handleOAuth,
		handleCustomOauth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
		setValue,
		createConnection,
	} = useConnectionForm(zoomPrivateAuthIntegrationSchema, "create");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, Integrations.zoom);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, Integrations.zoom, ConnectionAuthType.OauthPrivate);
				break;
			case ConnectionAuthType.privateServerToServer:
				await createConnection(connectionId, ConnectionAuthType.ApiKey, Integrations.zoom);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		if (connectionType.value === ConnectionAuthType.OauthDefault) {
			setValidationSchema(oauthSchema);

			return;
		}
		if (connectionType.value === ConnectionAuthType.OauthPrivate) {
			setValidationSchema(zoomPrivateAuthIntegrationSchema);

			return;
		}
		if (connectionType.value === ConnectionAuthType.privateServerToServer) {
			setValidationSchema(zoomPrivateToServerIntegrationSchema);

			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.zoom]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={zoomIntegrationAuthMethods}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>
			<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						control={control}
						copyToClipboard={copyToClipboard}
						errors={errors}
						isLoading={isLoading}
						mode="create"
						register={register}
						setValue={setValue}
					/>
				) : null}
			</form>
		</>
	);
};
