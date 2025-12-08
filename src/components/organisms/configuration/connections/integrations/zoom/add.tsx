import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@src/constants/connections/formsPerIntegrationsMapping.constants";
import { zoomIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { IntegrationAddFormProps, SelectOption } from "@src/interfaces/components";
import { getDefaultAuthType } from "@src/utilities";
import { zoomPrivateAuthIntegrationSchema, legacyOauthSchema, zoomServerToServerIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const ZoomIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	onSuccess,
	isGlobalConnection,
}: IntegrationAddFormProps) => {
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
	} = useConnectionForm(zoomPrivateAuthIntegrationSchema, "create", undefined, onSuccess, isGlobalConnection);

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(zoomIntegrationAuthMethods, Integrations.zoom)
	);

	const configureConnection = async (connectionId: string) => {
		if (!connectionType?.value) return;

		switch (connectionType.value) {
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, Integrations.zoom);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, Integrations.zoom, ConnectionAuthType.OauthPrivate);
				break;
			case ConnectionAuthType.serverToServer:
				await createConnection(connectionId, ConnectionAuthType.serverToServer, Integrations.zoom);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}

		switch (connectionType.value) {
			case ConnectionAuthType.OauthDefault:
				setValidationSchema(legacyOauthSchema);
				break;
			case ConnectionAuthType.OauthPrivate:
				setValidationSchema(zoomPrivateAuthIntegrationSchema);
				break;
			case ConnectionAuthType.serverToServer:
				setValidationSchema(zoomServerToServerIntegrationSchema);
				break;
			default:
				break;
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
				disabled={isLoading}
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
