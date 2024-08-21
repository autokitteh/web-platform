import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationGoogle } from "@constants/lists";
import { ConnectionAuthType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { googleIntegrationSchema, googleOauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const GoogleIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	type,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
	type: string;
}) => {
	const { t } = useTranslation("integrations");

	const {
		createConnection,
		errors,
		handleOAuth,
		handleSubmit,
		isLoading,
		register,
		reset,
		setValidationSchema,
		setValue,
	} = useConnectionForm({ json: "", auth_type: "json" }, googleIntegrationSchema, "create");

	const [connectionType, setConnectionType] = useState<SingleValue<SelectOption>>();

	const configureConnection = async (connectionId: string) => {
		switch (connectionType?.value) {
			case ConnectionAuthType.JsonKey:
				await createConnection(connectionId, ConnectionAuthType.JsonKey, Integrations.google);
				break;
			case ConnectionAuthType.Oauth:
				await handleOAuth(connectionId, Integrations.google);
				break;
			default:
				break;
		}
	};

	useEffect(() => {
		if (!connectionType?.value) {
			return;
		}
		if (connectionType.value === ConnectionAuthType.Oauth) {
			setValidationSchema(googleOauthSchema);
			setValue("auth_type", ConnectionAuthType.Oauth);

			return;
		}
		setValidationSchema(googleIntegrationSchema);
		setValue("auth_type", ConnectionAuthType.Json);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	useEffect(() => {
		if (connectionId) {
			configureConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	useEffect(() => {
		reset({ json: "" });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [type]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.google]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				label={t("placeholders.connectionType")}
				noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
				onChange={(option) => setConnectionType(option)}
				options={selectIntegrationGoogle}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>

			<form className="mt-6 flex w-full flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
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
