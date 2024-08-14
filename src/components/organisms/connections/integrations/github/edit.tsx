import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { githubIntegrationAuthMethods } from "@constants/lists";
import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { formsPerIntegrationsMapping } from "@src/constants";
import { Integrations } from "@src/enums/components";
import { githubIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const GithubIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [webhook, setWebhook] = useState<string | undefined>(undefined);

	const {
		connectionType,
		connectionVariables,
		copyToClipboard,
		errors,
		handleSubmit,
		isLoading,
		onSubmitEdit,
		register,
		setValue,
	} = useConnectionForm({ pat: "", secret: "", webhook: "" }, githubIntegrationSchema, "edit");

	useEffect(() => {
		if (connectionVariables) {
			const patWebhookKey: string | undefined = connectionVariables?.find(
				(variable) => variable.name === "pat_key"
			)?.value;

			setWebhook(patWebhookKey);
		}
	}, [connectionVariables]);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.github]?.[connectionType as ConnectionAuthType];

	const selectConnectionTypeValue = githubIntegrationAuthMethods.find((method) => method.value === connectionType);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled
				label={t("placeholders.connectionType")}
				options={githubIntegrationAuthMethods}
				placeholder={t("placeholders.selectConnectionType")}
				value={selectConnectionTypeValue}
			/>
			<form className="mt-6 flex items-start gap-10" id="connectionForm" onSubmit={handleSubmit(onSubmitEdit)}>
				<div className="flex w-full flex-col gap-6">
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
				</div>
			</form>
		</>
	);
};
