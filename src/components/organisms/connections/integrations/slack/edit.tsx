import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { ConnectionAuthType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { formsPerIntegrationsMapping } from "@src/constants";
import { selectIntegrationSlack } from "@src/constants/lists/connections";
import { Integrations } from "@src/enums/components";
import { slackIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const SlackIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [webhook] = useState<string | undefined>(undefined);

	const { connectionType, copyToClipboard, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm({ appToken: "", botToken: "" }, slackIntegrationSchema, "edit");

	const selectConnectionTypeValue = selectIntegrationSlack.find((method) => method.value === connectionType);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.slack]?.[selectConnectionTypeValue?.value as ConnectionAuthType];

	return (
		<form className="flex items-start gap-10" id="connectionForm" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					disabled={!!selectConnectionTypeValue}
					onChange={() => {}}
					options={selectIntegrationSlack}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectConnectionTypeValue}
				/>

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
	);
};
