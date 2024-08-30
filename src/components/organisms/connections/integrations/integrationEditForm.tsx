import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import { formsPerIntegrationsMapping } from "@constants";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";

import { Select } from "@components/molecules";

interface IntegrationEditFormProps {
	integrationType: Integrations;
	schemas: Partial<Record<ConnectionAuthType, any>>;
	selectOptions: Array<{ label: string; value: string }>;
}

export const IntegrationEditForm = ({ integrationType, schemas, selectOptions }: IntegrationEditFormProps) => {
	const { t } = useTranslation("integrations");
	const [webhook, setWebhook] = useState<string>();

	const {
		connectionType,
		connectionVariables,
		copyToClipboard,
		errors,
		handleSubmit,
		isLoading,
		onSubmitEdit,
		register,
		setConnectionType,
		setValidationSchema,
		setValue,
	} = useConnectionForm(schemas[ConnectionAuthType.NoAuth], "edit");

	useEffect(() => {
		if (connectionVariables) {
			const patWebhookKey = connectionVariables?.find((variable) => variable.name === "pat_key")?.value;

			setWebhook(patWebhookKey);
		}
	}, [connectionVariables]);

	useEffect(() => {
		if (connectionType && schemas[connectionType as ConnectionAuthType]) {
			setValidationSchema(schemas[connectionType as ConnectionAuthType]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType, schemas]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[integrationType]?.[connectionType as ConnectionAuthType];

	const selectConnectionTypeValue = useMemo(
		() => selectOptions.find((method) => method.value === connectionType),
		[connectionType, selectOptions]
	);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={!!selectConnectionTypeValue}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option?.value)}
				options={selectOptions}
				placeholder={t("placeholders.selectConnectionType")}
				value={selectConnectionTypeValue}
			/>
			<form className="mt-6 flex flex-col items-stretch gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						copyToClipboard={copyToClipboard}
						errors={errors}
						isLoading={isLoading}
						mode="edit"
						patWebhookKey={webhook}
						register={register}
						setValue={setValue}
					/>
				) : null}
			</form>
		</>
	);
};
