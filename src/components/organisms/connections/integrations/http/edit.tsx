import React, { useEffect, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationHttp } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { httpBasicIntegrationSchema, httpBearerIntegrationSchema, oauthSchema } from "@validations";

import { Select } from "@components/molecules";

export const HttpIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");

	const {
		connectionType,
		errors,
		handleSubmit,
		isLoading,
		onSubmitEdit,
		register,
		setConnectionType,
		setValidationSchema,
		setValue,
	} = useConnectionForm(httpBasicIntegrationSchema, "edit");

	useEffect(() => {
		if (!connectionType) {
			return;
		}
		if (connectionType === ConnectionAuthType.Basic) {
			setValidationSchema(httpBasicIntegrationSchema);

			return;
		}
		if (connectionType === ConnectionAuthType.Bearer) {
			setValidationSchema(httpBearerIntegrationSchema);

			return;
		}
		if (connectionType === ConnectionAuthType.NoAuth) {
			setValidationSchema(oauthSchema);

			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.http]?.[connectionType as ConnectionAuthType];

	const selectConnectionTypeValue = useMemo(
		() => selectIntegrationHttp.find((method) => method.value === connectionType),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={!!selectConnectionTypeValue}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option?.value)}
				options={selectIntegrationHttp}
				placeholder={t("placeholders.selectConnectionType")}
				value={selectConnectionTypeValue}
			/>
			<form className="mt-6 flex items-start gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
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
