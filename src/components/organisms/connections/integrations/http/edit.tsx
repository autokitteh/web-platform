import React, { useEffect } from "react";

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

	const { connectionType, errors, handleSubmit, isLoading, onSubmitEdit, register, setValidationSchema, setValue } =
		useConnectionForm(
			{ basic_username: "", basic_password: "", bearer_access_token: "" },
			httpBasicIntegrationSchema,
			"edit"
		);

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
		if (connectionType === ConnectionAuthType.Oauth) {
			setValidationSchema(oauthSchema);

			return;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionType]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.http]?.[connectionType as ConnectionAuthType];

	const selectConnectionTypeValue = selectIntegrationHttp.find((method) => method.value === connectionType);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled
				label={t("placeholders.connectionType")}
				options={selectIntegrationHttp}
				placeholder={t("placeholders.selectConnectionType")}
				value={selectConnectionTypeValue}
			/>
			<form className="mt-6 flex items-start gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
				<div className="flex w-full flex-col gap-6">
					{ConnectionTypeComponent ? (
						<ConnectionTypeComponent
							errors={errors}
							isLoading={isLoading}
							mode="edit"
							register={register}
							setValue={setValue}
						/>
					) : null}
				</div>
			</form>
		</>
	);
};
