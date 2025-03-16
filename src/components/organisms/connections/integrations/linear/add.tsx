import React from "react";

import { useTranslation } from "react-i18next";

import { formsPerIntegrationsMapping } from "@src/constants";
import { linearIntegrationAuthMethods } from "@src/constants/lists/connections";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";

import { Select } from "@components/molecules";

export const LinearIntegrationAddForm = ({ triggerParentFormSubmit }: { triggerParentFormSubmit: () => void }) => {
	const { t } = useTranslation("integrations");
	const { control, errors, handleSubmit, isLoading, register, setValue, clearErrors } = useConnectionForm(
		Integrations.linear,
		"create"
	);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.linear]?.[connectionType?.value as ConnectionAuthType];

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled={isLoading}
				label={t("placeholders.connectionType")}
				onChange={(option) => setConnectionType(option)}
				options={linearIntegrationAuthMethods}
				placeholder={t("placeholders.selectConnectionType")}
				value={connectionType}
			/>
			<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
				{ConnectionTypeComponent ? (
					<ConnectionTypeComponent
						clearErrors={clearErrors}
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
