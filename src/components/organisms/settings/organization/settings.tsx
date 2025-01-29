import React, { useMemo, useState } from "react";

import debounce from "lodash/debounce";
import omit from "lodash/omit";
import { useTranslation } from "react-i18next";

import { MemberRole } from "@src/enums";
import { useDeleteOrganization } from "@src/hooks";
import { useOrganizationStore, useToastStore } from "@src/store";
import { isNameEmpty, isNameExist } from "@src/utilities";

import { Button, ErrorMessage, Input, SuccessMessage, Typography, Spinner } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";
import { WarningDeleteOrganizationModal } from "@components/organisms/settings/user/organizations";

import { TrashIcon } from "@assets/image/icons";

export const OrganizationSettings = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const [nameError, setNameError] = useState("");
	const { updateOrganization, organizations, user, isLoading, getCurrentOrganizationEnriched } =
		useOrganizationStore();
	const [displaySuccess, setDisplaySuccess] = useState(false);
	const { data: organization } = getCurrentOrganizationEnriched();

	const addToast = useToastStore((state) => state.addToast);
	const [organizationDisplayName, setOrganizationDisplayName] = useState(organization?.displayName || "");
	const { onDelete, organizationIdInDeletion, handleDeleteOrganization } = useDeleteOrganization();

	const organizationsNames = useMemo(
		() =>
			new Set(
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				(Object.entries(organizations) || []).map(([_organizationId, organization]) => organization.displayName)
			),
		[organizations]
	);
	const renameOrganization = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const displayName = event.target.value;
		const nameValidationError = isNameExist(displayName, organizationsNames) || isNameEmpty(displayName);
		if (nameValidationError) {
			setNameError(nameValidationError);
			return;
		}
		setNameError("");
		setOrganizationDisplayName(displayName);
		const { error } = await updateOrganization({ ...omit(organization, "currentMember"), displayName }, [
			"display_name",
		]);
		if (error) {
			addToast({
				message: t("form.errors.updateOrganizationFailed"),
				type: "error",
			});
			return;
		}
		setDisplaySuccess(true);
		setTimeout(() => {
			setDisplaySuccess(false);
		}, 3000);
	};
	const debouncedRename = debounce(renameOrganization, 2000);

	if (!organization) {
		return null;
	}

	const isNameInputDisabled =
		isLoading.updatingOrganization || organization?.currentMember?.role !== MemberRole.admin;

	return (
		<div className="w-3/4">
			<Typography className="mb-4 font-bold" element="h2" size="xl">
				{t("title", { name: organizationDisplayName })}
			</Typography>
			<div className="relative mb-6">
				<Input
					disabled={isNameInputDisabled}
					isError={!!nameError}
					label={t("form.organizationDisplayName")}
					onChange={debouncedRename}
					value={organizationDisplayName}
				/>
				<div className="h-6">
					<ErrorMessage>{nameError as string}</ErrorMessage>
					{displaySuccess ? (
						<SuccessMessage>{t("form.messages.nameUpdatedSuccessfully")}</SuccessMessage>
					) : null}
				</div>
			</div>
			<div className="relative mb-6">
				<Input disabled label={t("form.organizationUniqueName")} value={organization?.uniqueName} />
			</div>

			<Button
				className="gap-3 px-4 text-base font-semibold text-white"
				disabled={organization?.id === user?.defaultOrganizationId}
				onClick={() => handleDeleteOrganization(organization)}
				title={t("form.buttons.deleteOrganizationName", { name: organization?.displayName })}
				variant="outline"
			>
				{organizationIdInDeletion === organization.id ? (
					<Spinner className="size-4" />
				) : (
					<TrashIcon className="size-4 stroke-white" />
				)}
				{t("form.buttons.deleteOrganization")}
			</Button>
			<DeleteOrganizationModal isDeleting={isLoading.deletingOrganization} onDelete={onDelete} />
			<WarningDeleteOrganizationModal />
		</div>
	);
};
