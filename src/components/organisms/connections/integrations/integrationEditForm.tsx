import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping, integrationVariablesMapping } from "@constants";
import { ConnectionAuthType } from "@enums";
import { Integrations, isGoogleIntegration } from "@src/enums/components";
import { useConnectionForm, useEvent } from "@src/hooks";
import { SelectOption } from "@src/interfaces/components";
import { setFormValues } from "@src/utilities";

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
		handleGoogleOauth,
		handleOAuth,
		handleSubmit,
		isLoading,
		onSubmitEdit,
		register,
		setConnectionType,
		setValidationSchema,
		setValue,
	} = useConnectionForm(schemas[ConnectionAuthType.NoAuth], "edit");

	const [initialConnectionType, setInitialConnectionType] = useState<boolean>();
	const [isFirstConnectionType, setIsFirstConnectionType] = useState(true);
	const { dispatch: dispacthConnectionInfoLoaded } = useEvent("onConnectionLoaded");

	useEffect(() => {
		if (!isGoogleIntegration(integrationType)) {
			return;
		}

		if (connectionType === ConnectionAuthType.Oauth) {
			setValue("auth_type", ConnectionAuthType.Oauth);
			setValue("auth_scopes", integrationType);

			return;
		}
		setValue("auth_type", ConnectionAuthType.Json);

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

	useEffect(() => {
		dispacthConnectionInfoLoaded(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const selectConnectionTypeValue = useMemo(
		() => selectOptions.find((method) => method.value === connectionType),
		[connectionType, selectOptions]
	);

	const onSubmit = () => {
		if (connectionId && connectionType === ConnectionAuthType.Oauth) {
			if (isGoogleIntegration(integrationType)) {
				handleGoogleOauth(connectionId);

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
		setConnectionType(option?.value);
	};

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={initialConnectionType}
				label={t("placeholders.connectionType")}
				onChange={handleConnectionTypeChange}
				options={selectOptions}
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
