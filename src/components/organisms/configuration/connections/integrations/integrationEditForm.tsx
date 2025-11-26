import React, { useEffect, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { BackendConnectionUrlAuthType, ConnectionAuthType, TourId } from "@enums";
import {
	getIntegrationSchemas,
	getIntegrationAuthOptions,
	getSchemaByAuthType,
	getAuthMethodForm,
	getIntegrationVariables,
} from "@src/constants/connections";
import {
	Integrations,
	defaultGoogleConnectionName,
	isGoogleIntegration,
	isLegacyIntegration,
	hasLegacyConnectionType,
	isMicrosofIntegration,
} from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { SelectOption } from "@src/interfaces/components";
import { useTourStore } from "@src/store";
import { setFormValues, stripMicrosoftConnectionName } from "@src/utilities";

import { Select } from "@components/molecules";

export const IntegrationEditForm = ({ integrationType }: { integrationType: Integrations }) => {
	const { t } = useTranslation("integrations");

	const schemas = getIntegrationSchemas(integrationType);
	const authOptions = getIntegrationAuthOptions(integrationType);

	const {
		connectionId,
		connectionType,
		connectionVariables,
		control,
		copyToClipboard,
		errors,
		handleCustomOauth,
		handleOAuth,
		handleLegacyOAuth,
		handleSubmit,
		isLoading,
		onSubmitEdit,
		register,
		setConnectionType,
		setValidationSchema,
		setValue,
	} = useConnectionForm(schemas[0], "edit", authOptions);

	const { activeTour } = useTourStore();

	useEffect(() => {
		const isGmailTour = activeTour?.tourId === TourId.sendEmail && integrationType === Integrations.gmail;
		const isSlackTour = activeTour?.tourId === TourId.sendSlack && integrationType === Integrations.slack;
		if (isGmailTour || isSlackTour) {
			setValue("auth_type", ConnectionAuthType.OauthDefault);
			setValue("auth_scopes", integrationType);
			setConnectionType(ConnectionAuthType.OauthDefault);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!(isGoogleIntegration(integrationType) || isMicrosofIntegration(integrationType))) {
			return;
		}

		if (isGoogleIntegration(integrationType)) {
			if (connectionType === ConnectionAuthType.Oauth) {
				setValue("auth_type", ConnectionAuthType.Oauth);
				setValue("auth_scopes", integrationType);
				return;
			}
			setValue("auth_type", ConnectionAuthType.Json);
			return;
		}

		setValue("auth_type", connectionType);
		setValue("auth_scopes", stripMicrosoftConnectionName(integrationType));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionType) {
			const schemaByAuthType = getSchemaByAuthType(integrationType, connectionType as ConnectionAuthType);
			if (schemaByAuthType) {
				setValidationSchema(schemaByAuthType);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType, schemas]);

	const ConnectionTypeComponent = getAuthMethodForm(integrationType, connectionType as ConnectionAuthType);

	const selectConnectionTypeValue = useMemo(
		() => authOptions.find((method) => method.value === connectionType),
		[connectionType, authOptions]
	);

	const filteredSelectOptions = useMemo(() => {
		if (hasLegacyConnectionType(integrationType) && !connectionType) {
			return authOptions.filter((authMethod) => authMethod.value !== ConnectionAuthType.Oauth);
		}

		return authOptions;
	}, [connectionType, authOptions, integrationType]);

	const onSubmit = () => {
		if (
			connectionId &&
			(connectionType === ConnectionAuthType.Oauth ||
				connectionType === ConnectionAuthType.OauthDefault ||
				connectionType === ConnectionAuthType.OauthPrivate)
		) {
			if (isGoogleIntegration(integrationType)) {
				handleCustomOauth(
					connectionId,
					defaultGoogleConnectionName,
					connectionType,
					BackendConnectionUrlAuthType.oauth
				);

				return;
			}

			if (isMicrosofIntegration(integrationType) || integrationType === Integrations.linear) {
				const backendAuthType =
					connectionType === ConnectionAuthType.OauthPrivate
						? BackendConnectionUrlAuthType.oauthPrivate
						: BackendConnectionUrlAuthType.oauthDefault;
				handleCustomOauth(connectionId, integrationType, connectionType, backendAuthType);

				return;
			}
			if (isLegacyIntegration(integrationType)) {
				handleLegacyOAuth(connectionId, integrationType, BackendConnectionUrlAuthType.oauth);

				return;
			}
			handleOAuth(connectionId, integrationType, BackendConnectionUrlAuthType.oauthDefault);

			return;
		}
		onSubmitEdit();
	};

	useEffect(() => {
		if (connectionVariables) {
			const variablesMapping = getIntegrationVariables(integrationType);
			if (variablesMapping) {
				setFormValues(connectionVariables, variablesMapping, setValue);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	const handleConnectionTypeChange = (option: SingleValue<SelectOption>) => {
		setConnectionType(option?.value);
	};

	const noConnectionTypeEnableTypeChange = useMemo(() => {
		if (!connectionVariables || !connectionVariables.length) return true;
		return !connectionVariables.find(
			(variable) => variable.name === "connection_type" && variable.value === connectionType
		);
	}, [connectionVariables, connectionType]);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={!noConnectionTypeEnableTypeChange}
				label={t("placeholders.connectionType")}
				onChange={handleConnectionTypeChange}
				options={filteredSelectOptions}
				placeholder={t("placeholders.selectConnectionType")}
				value={selectConnectionTypeValue}
			/>
			<form className="mt-6 flex flex-col items-stretch gap-6" onSubmit={handleSubmit(onSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						control={control}
						copyToClipboard={copyToClipboard}
						errors={errors}
						isLoading={isLoading}
						mode="edit"
						register={register}
						setValue={setValue}
					/>
				) : null}
			</form>
		</>
	);
};
