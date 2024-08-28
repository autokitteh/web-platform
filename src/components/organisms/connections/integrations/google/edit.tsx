import React from "react";

import { useTranslation } from "react-i18next";

import { formsPerIntegrationsMapping } from "@constants";
import { selectIntegrationGoogle } from "@constants/lists";
import { ConnectionAuthType } from "@enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { googleIntegrationSchema } from "@validations";

import { Select } from "@components/molecules";

export const GoogleIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");

	const { connectionType, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		googleIntegrationSchema,
		"edit"
	);

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.google]?.[connectionType as ConnectionAuthType];

	const selectConnectionTypeValue = selectIntegrationGoogle.find((method) => method.value === connectionType);

	return (
		<>
			<Select
				aria-label={t("placeholders.selectConnectionType")}
				disabled
				label={t("placeholders.connectionType")}
				noOptionsLabel={t("placeholders.noConnectionTypesAvailable")}
				options={selectIntegrationGoogle}
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
