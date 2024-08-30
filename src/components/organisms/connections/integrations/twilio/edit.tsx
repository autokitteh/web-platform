import React, { useEffect, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationTwilio } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { oauthSchema, twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const TwilioIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");

	const { connectionType, errors, handleSubmit, isLoading, onSubmitEdit, register, setValidationSchema, setValue } =
		useConnectionForm(oauthSchema, "edit");

	useEffect(() => {
		if (!connectionType) {
			return;
		}
		if (connectionType === ConnectionAuthType.AuthToken) {
			setValidationSchema(twilioTokenIntegrationSchema);

			return;
		}
		if (connectionType === ConnectionAuthType.ApiKey) {
			setValidationSchema(twilioApiKeyIntegrationSchema);

			return;
		}
	}, [connectionType, setValidationSchema]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.twilio]?.[connectionType as ConnectionAuthType];

	const selectConnectionTypeValue = useMemo(
		() => selectIntegrationTwilio.find((method) => method.value === connectionType),
		[connectionType]
	);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={!!selectConnectionTypeValue}
				label={t("placeholders.connectionType")}
				options={selectIntegrationTwilio}
				placeholder={t("placeholders.selectConnectionType")}
				value={selectConnectionTypeValue}
			/>

			<form className="mt-4 flex w-full flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
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
