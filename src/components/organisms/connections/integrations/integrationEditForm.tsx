import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { ConnectionAuthType } from "@enums";
import { Integrations, ModalName, isGoogleIntegration } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { SelectOption } from "@src/interfaces/components";
import { useCacheStore, useModalStore } from "@src/store";

import { Select } from "@components/molecules";
import { WarningDeploymentActivetedModal } from "@components/organisms";

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

	const { hasActiveDeployments } = useCacheStore();
	const { closeModal, openModal } = useModalStore();

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

	const selectConnectionTypeValue = useMemo(
		() => selectOptions.find((method) => method.value === connectionType),
		[connectionType, selectOptions]
	);

	const onSubmit = () => {
		if (connectionId && connectionType === ConnectionAuthType.Oauth) {
			closeModal(ModalName.warningDeploymentActive);
			if (isGoogleIntegration(integrationType)) {
				handleGoogleOauth(connectionId);

				return;
			}
			handleOAuth(connectionId, integrationType);

			return;
		}
		onSubmitEdit();
	};

	const handleFormSubmit = () => {
		if (hasActiveDeployments) {
			openModal(ModalName.warningDeploymentActive);

			return;
		}
		onSubmit();
	};

	useEffect(() => {
		const setFormValue = (fieldName: string, variableName: string) => {
			const value = connectionVariables?.find((variable) => variable.name === variableName)?.value;
			if (!value) return;
			setValue(fieldName, value);
		};
		setFormValue("form_id", "FormID");
		setFormValue("cal_id", "CalendarID");
		setFormValue("json", "JSON");
		// twillio
		setFormValue("account_sid", "accountSID");
		setFormValue("api_key", "apiKey");
		setFormValue("api_secret", "apiSecret");
		// slack
		setFormValue("bot_token", "botToken");
		setFormValue("app_token", "appToken");
		// atlassian- jira, confluence
		setFormValue("base_url", "BaseURL");
		setFormValue("token", "Token");
		setFormValue("email", "Email");

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
			<form className="mt-6 flex flex-col items-stretch gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						control={control}
						copyToClipboard={copyToClipboard}
						errors={errors}
						isLoading={isLoading}
						register={register}
						setValue={setValue}
					/>
				) : null}
			</form>

			<WarningDeploymentActivetedModal onClick={onSubmit} />
		</>
	);
};
