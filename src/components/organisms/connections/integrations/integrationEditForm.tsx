import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping, integrationVariablesMapping } from "@constants";
import { ConnectionAuthType } from "@enums";
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
		editConnectionType,
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
		setEditConnectionType,
		setValidationSchema,
		setValue,
	} = useConnectionForm(schemas[ConnectionAuthType.NoAuth], "edit");

	const [initialConnectionType, setInitialConnectionType] = useState<boolean>();
	const [isFirstConnectionType, setIsFirstConnectionType] = useState(true);

	useEffect(() => {
		if (!(isGoogleIntegration(integrationType) || isMicrosofIntegration(integrationType))) {
			return;
		}

		if (isGoogleIntegration(integrationType)) {
			if (editConnectionType === ConnectionAuthType.Oauth) {
				setValue("auth_type", ConnectionAuthType.Oauth);
				setValue("auth_scopes", integrationType);
				return;
			}
			setValue("auth_type", ConnectionAuthType.Json);
			return;
		}

		setValue("auth_type", editConnectionType);
		setValue("auth_scopes", stripMicrosoftConnectionName(integrationType));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editConnectionType]);

	useEffect(() => {
		if (editConnectionType && schemas[editConnectionType as ConnectionAuthType]) {
			setValidationSchema(schemas[editConnectionType as ConnectionAuthType]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editConnectionType, schemas]);

	useEffect(() => {
		if (editConnectionType && isFirstConnectionType) {
			setInitialConnectionType(!!editConnectionType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editConnectionType]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[integrationType]?.[editConnectionType as ConnectionAuthType];

	const selectConnectionTypeValue = useMemo(
		() => selectOptions.find((method) => method.value === editConnectionType),
		[editConnectionType, selectOptions]
	);

	const filteredSelectOptions = useMemo(() => {
		if (hasLegacyConnectionType(integrationType) && !editConnectionType) {
			return selectOptions.filter((authMethod) => authMethod.value !== ConnectionAuthType.Oauth);
		}

		return selectOptions;
	}, [editConnectionType, selectOptions, integrationType]);

	const onSubmit = () => {
		if (
			connectionId &&
			(editConnectionType === ConnectionAuthType.Oauth ||
				editConnectionType === ConnectionAuthType.OauthDefault ||
				editConnectionType === ConnectionAuthType.OauthPrivate)
		) {
			if (isGoogleIntegration(integrationType)) {
				handleCustomOauth(connectionId, defaultGoogleConnectionName);

				return;
			}

			if (isMicrosofIntegration(integrationType)) {
				handleCustomOauth(connectionId, integrationType, editConnectionType);

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
			setFormValues(
				connectionVariables,
				integrationVariablesMapping[integrationType as keyof typeof integrationVariablesMapping],
				setValue
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	const handleConnectionTypeChange = (option: SingleValue<SelectOption>) => {
		setIsFirstConnectionType(false);
		setEditConnectionType(option?.value);
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
