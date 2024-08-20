import React, { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";
import { ZodObject, ZodRawShape } from "zod";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationTwilio } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { twilioApiKeyIntegrationSchema, twilioTokenIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const TwilioIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const formSchema = useMemo(() => {
		if (connectionType?.value === ConnectionAuthType.AuthToken) return twilioTokenIntegrationSchema;
		if (connectionType?.value === ConnectionAuthType.ApiKey) return twilioApiKeyIntegrationSchema;
	}, [connectionType]) as ZodObject<ZodRawShape>;

	const { createConnection, errors, handleSubmit, isLoading, register, setValidationSchema, setValue } =
		useConnectionForm(
			{
				account_sid: "",
				auth_token: "",
				api_key: "",
				api_secret: "",
			},
			formSchema,
			"create"
		);

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		if (connectionType.value === ConnectionAuthType.AuthToken) {
			setValidationSchema(twilioTokenIntegrationSchema);

			return;
		}
		setValidationSchema(twilioApiKeyIntegrationSchema);
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
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={selectIntegrationTwilio}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>

			<form className="mt-6 flex items-start gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				<div className="flex w-full flex-col gap-6">
					{ConnectionTypeComponent ? (
						<ConnectionTypeComponent
							errors={errors}
							isLoading={isLoading}
							mode="create"
							register={register}
							setValue={setValue}
						/>
					) : null}
				</div>
			</form>
		</>
	);
};
