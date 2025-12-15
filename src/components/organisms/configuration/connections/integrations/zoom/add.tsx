import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { IntegrationAddFormProps, SelectOption } from "@src/interfaces/components";
import {
	getAuthMethodsForIntegration,
	getDefaultAuthTypeWithFeatureFlags,
	getFormForAuthMethod,
	getSchemaForAuthMethod,
} from "@src/utilities";
import { zoomPrivateAuthIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const ZoomIntegrationAddForm = ({ connectionId, triggerParentFormSubmit }: IntegrationAddFormProps) => {
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

	const authMethods = getAuthMethodsForIntegration(Integrations.zoom);
	const defaultAuthType = getDefaultAuthTypeWithFeatureFlags(Integrations.zoom, authMethods);

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		authMethods.find((m) => m.value === defaultAuthType) || authMethods[0]
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
		const schema = getSchemaForAuthMethod(Integrations.zoom, connectionType.value as ConnectionAuthType);
		if (schema) {
			setValidationSchema(schema);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent = connectionType?.value
		? getFormForAuthMethod(Integrations.zoom, connectionType.value as ConnectionAuthType)
		: null;

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={authMethods}
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
