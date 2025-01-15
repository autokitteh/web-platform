import React, { useCallback, useState } from "react";

import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useOrganizationStore } from "@src/store";
import { validateEntitiesName } from "@src/utilities";

import { ErrorMessage, Input, SuccessMessage, Typography } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";

export const OrganizationSettings = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const { organizationId } = useParams();
	const [nameError, setNameError] = useState("");
	const { currentOrganization, updateOrganization, organizationsList } = useOrganizationStore();
	const [organizationDisplayName, setOrganizationDisplayName] = useState<string>(
		currentOrganization?.displayName || ""
	);

	const renameOrganization = (event: React.ChangeEvent<HTMLInputElement>) => {
		const displayName = event.target.value;
		if (!displayName) {
			setNameError(t("form.errors.nameRequired"));
			return;
		}
		const organizationsNames = new Set((organizationsList || []).map((organization) => organization.displayName));
		const isNameInvalid = validateEntitiesName(displayName, organizationsNames);
		if (isNameInvalid) {
			setNameError(isNameInvalid);
			return;
		}
		setNameError("");
		setOrganizationDisplayName(displayName);
		updateOrganization({ ...currentOrganization, displayName });
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedRename = useCallback(debounce(renameOrganization, 1500), [organizationId]);

	return (
		<div className="w-3/4">
			<Typography className="mb-4 font-bold" element="h2" size="xl">
				{t("title", { name: currentOrganization?.displayName })}
			</Typography>
			<div className="relative mb-6">
				<Input
					isError={!!nameError}
					label={t("form.organizationDisplayName")}
					onChange={debouncedRename}
					value={organizationDisplayName}
				/>

				<ErrorMessage>{nameError as string}</ErrorMessage>
				{organizationDisplayName ? (
					<SuccessMessage>{t("form.messages.nameUpdatedSuccessfully")}</SuccessMessage>
				) : null}
			</div>
			<div className="relative mb-6">
				<Input disabled label={t("form.organizationUniqueName")} />{" "}
			</div>

			<DeleteOrganizationModal />
		</div>
	);
};
