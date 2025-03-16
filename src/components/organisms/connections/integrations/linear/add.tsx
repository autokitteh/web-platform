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
	const { control, errors, handleSubmit, isLoading, register, setValue, clearErrors } = useConnectionForm("create");

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[Integrations.linear]?.[connectionType?.value as ConnectionAuthType];

	return <div />;
};
