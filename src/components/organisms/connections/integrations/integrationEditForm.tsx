import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { ConnectionAuthType } from "@enums";
import { Integrations, isGoogleIntegration } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { SelectOption } from "@src/interfaces/components";

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
	const [isFirstConnectionType, setIsFirstConnectionType] = useState<boolean>(true);

	useEffect(() => {
		if (isGoogleIntegration(integrationType)) {
			setValue("auth_type", ConnectionAuthType.Oauth);
			setValue("auth_scopes", integrationType);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	const handleFormSubmit = () => {
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
		const formId = connectionVariables?.find((variable) => variable.name === "FormID")?.value;
		if (formId) {
			setValue("form_id", formId);
		}
		const calendarId = connectionVariables?.find((variable) => variable.name === "CalendarID")?.value;
		if (calendarId) {
			setValue("cal_id", calendarId);
		}
		const jsonKey = connectionVariables?.find((variable) => variable.name === "JSON")?.value;
		if (jsonKey) {
			setValue("json", jsonKey);
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
			<form className="mt-6 flex flex-col items-stretch gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
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
