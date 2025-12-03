import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationTwilio } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getDefaultAuthType } from "@src/utilities";
import { legacyOauthSchema, twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const TwilioIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>(
		getDefaultAuthType(selectIntegrationTwilio, Integrations.twilio)
	);

	const { control, createConnection, errors, handleSubmit, isLoading, register, setValidationSchema, setValue } =
		useConnectionForm(legacyOauthSchema, "create");

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		if (connectionType.value === ConnectionAuthType.ApiToken) {
			// Changed from AuthToken to ApiToken
			setValidationSchema(twilioTokenIntegrationSchema);

			return;
		}
		if (connectionType.value === ConnectionAuthType.ApiKey) {
			setValidationSchema(twilioApiKeyIntegrationSchema);

			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, connectionType?.value as ConnectionAuthType, Integrations.twilio);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.twilio]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={selectIntegrationTwilio}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>

			<form className="mt-6 flex w-full flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						control={control}
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
