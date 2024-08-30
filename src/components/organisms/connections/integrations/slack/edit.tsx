import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationSlack } from "@constants/lists/connections";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { slackIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const SlackIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");

	const { connectionType, errors, handleSubmit, isLoading, onSubmitEdit, register, setConnectionType, setValue } =
		useConnectionForm(slackIntegrationSchema, "edit");

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.slack]?.[connectionType as ConnectionAuthType];

	const selectConnectionTypeValue = useMemo(
		() => selectIntegrationSlack.find((method) => method.value === connectionType),
		[connectionType]
	);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={!!selectConnectionTypeValue}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option?.value)}
				options={selectIntegrationSlack}
				placeholder={t("placeholders.selectConnectionType")}
				value={selectConnectionTypeValue}
			/>
			<form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit(onSubmitEdit)}>
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
