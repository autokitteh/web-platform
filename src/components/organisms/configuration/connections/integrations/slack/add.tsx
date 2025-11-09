import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationSlack } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { oauthSchema, slackIntegrationSchema, slackPrivateAuthIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const SlackIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const {
		control,
		handleCustomOauth,
		createConnection,
		errors,
		handleOAuth,
		handleSubmit,
		isLoading,
		register,
		setValidationSchema,
	} = useConnectionForm(slackIntegrationSchema, "create");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.Socket:
				await createConnection(connectionId, ConnectionAuthType.Socket, Integrations.slack);
				break;
			case ConnectionAuthType.OauthDefault:
				await handleOAuth(connectionId, Integrations.slack);
				break;
			case ConnectionAuthType.OauthPrivate:
				await handleCustomOauth(connectionId, Integrations.slack, ConnectionAuthType.OauthPrivate);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		const legacyConnectionType = connectionType?.value === ConnectionAuthType.Oauth;
		if (connectionType.value === ConnectionAuthType.OauthDefault || legacyConnectionType) {
			setValidationSchema(oauthSchema);

			if (legacyConnectionType) {
				(selectIntegrationSlack as SelectOption[]).splice(
					selectIntegrationSlack.findIndex((opt) => opt.value === ConnectionAuthType.OauthDefault),
					1,
					{ label: "OAuth v2 - Default app", value: ConnectionAuthType.Oauth }
				);
			}

			return;
		}
		if (connectionType.value === ConnectionAuthType.OauthPrivate) {
			setValidationSchema(slackPrivateAuthIntegrationSchema);

			return;
		}
		setValidationSchema(slackIntegrationSchema);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.slack]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={selectIntegrationSlack}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>
			<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						control={control}
						errors={errors}
						isLoading={isLoading}
						register={register}
					/>
				) : null}
			</form>
		</>
	);
};
