import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping, integrationVariablesMapping } from "@constants";
import { ConnectionAuthType, TourId } from "@enums";
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

export const IntegrationEditForm = ({
	integrationType,
	schemas,
	selectOptions,
}: {
	integrationType: Integrations;
	schemas: Partial<Record<ConnectionAuthType, any>>;
	selectOptions: Array<{ label: string; value: string }>;
}) => {
	const { t } = useTranslation("integrations");

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
	} = useConnectionForm(schemas[ConnectionAuthType.NoAuth], "edit", selectOptions);

	const [initialConnectionType, setInitialConnectionType] = useState<boolean>();
	const [isFirstConnectionType, setIsFirstConnectionType] = useState(true);

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
		if (connectionType && schemas[connectionType as ConnectionAuthType]) {
			setValidationSchema(schemas[connectionType as ConnectionAuthType]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType, schemas]);

	useEffect(() => {
		if (connectionType && isFirstConnectionType) {
			setInitialConnectionType(!!connectionType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[integrationType]?.[connectionType as ConnectionAuthType];

	const selectConnectionTypeValue = useMemo(
		() => selectOptions.find((method) => method.value === connectionType),
		[connectionType, selectOptions]
	);

	const filteredSelectOptions = useMemo(() => {
		if (hasLegacyConnectionType(integrationType) && !connectionType) {
			return selectOptions.filter((authMethod) => authMethod.value !== ConnectionAuthType.Oauth);
		}

		return selectOptions;
	}, [connectionType, selectOptions, integrationType]);

	const onSubmit = () => {
		if (
			connectionId &&
			(connectionType === ConnectionAuthType.Oauth ||
				connectionType === ConnectionAuthType.OauthDefault ||
				connectionType === ConnectionAuthType.OauthPrivate)
		) {
			if (isGoogleIntegration(integrationType)) {
				handleCustomOauth(connectionId, defaultGoogleConnectionName);

				return;
			}

			if (isMicrosofIntegration(integrationType) || integrationType === Integrations.linear) {
				handleCustomOauth(connectionId, integrationType, connectionType);

				return;
			}
			if (isLegacyIntegration(integrationType)) {
				handleLegacyOAuth(connectionId, integrationType);

				return;
			}
			handleOAuth(connectionId, integrationType);

			return;
		}
		onSubmitEdit();
	};

	useEffect(() => {
		if (connectionVariables) {
			const variablesMapping =
				integrationVariablesMapping[integrationType as keyof typeof integrationVariablesMapping];
			if (variablesMapping) {
				setFormValues(connectionVariables, variablesMapping, setValue);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	const handleConnectionTypeChange = (option: SingleValue<SelectOption>) => {
		setIsFirstConnectionType(false);
		setConnectionType(option?.value);
	};

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={initialConnectionType}
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
