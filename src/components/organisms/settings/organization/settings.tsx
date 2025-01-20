import React, { useMemo, useState } from "react";

import debounce from "lodash/debounce";
import omit from "lodash/omit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { isNameEmpty, isNameExist } from "@src/utilities";

import { Button, ErrorMessage, Input, Typography } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";

import { TrashIcon } from "@assets/image/icons";

export const OrganizationSettings = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const [nameError, setNameError] = useState("");
	const {
		updateOrganization,
		organizations,
		deleteOrganization,
		user,
		isLoading,
		logoutFunction,
		getCurrentOrganizationEnriched,
	} = useOrganizationStore();
	const [displaySuccess, setDisplaySuccess] = useState(false);
	const { openModal, closeModal } = useModalStore();
	const { data: organization } = getCurrentOrganizationEnriched();
	const navigate = useNavigate();

	const addToast = useToastStore((state) => state.addToast);
	const [organizationDisplayName, setOrganizationDisplayName] = useState(organization?.displayName || "");

	const organizationsNames = useMemo(
		() =>
			new Set(
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				(Object.entries(organizations) || []).map(([_organizationId, organization]) => organization.displayName)
			),
		[organizations]
	);
	const renameOrganization = (event: React.ChangeEvent<HTMLInputElement>) => {
		const displayName = event.target.value;
		const nameValidationError = isNameExist(displayName, organizationsNames) || isNameEmpty(displayName);
		if (nameValidationError) {
			setNameError(nameValidationError);
			return;
		}
		setNameError("");
		setOrganizationDisplayName(displayName);
		updateOrganization({ ...omit(organization, "currentMember"), displayName });
		setDisplaySuccess(true);
		setTimeout(() => {
			setDisplaySuccess(false);
		}, 3000);
	};
	const debouncedRename = debounce(renameOrganization, 2000);

	if (!organization) {
		return null;
	}

	const onDelete = async () => {
		const { error } = await deleteOrganization(omit(organization, "currentMember"));
		closeModal(ModalName.deleteOrganization);

		if (error) {
			addToast({
				message: t("form.errors.deleteOrganizationFailed"),
				type: "error",
			});

			return;
		}

		addToast({
			message: t("form.messages.organizationDeleted", { name: organization?.displayName }),
			type: "success",
		});
		setTimeout(() => {
			if (!user?.defaultOrganizationId) {
				LoggerService.error(
					namespaces.ui.organizationSettings,
					t("errors.defaultOrganizationIdMissing", { userId: user?.id })
				);
				logoutFunction();
				return;
			}
			navigate(`/switch-organization/${user.defaultOrganizationId}`);
		}, 3000);
	};

	return (
		<div className="w-3/4">
			<Typography className="mb-4 font-bold" element="h2" size="xl">
				{t("title", { name: organizationDisplayName })}
			</Typography>
			<div className="relative mb-6">
				<Input
					isError={!!nameError}
					label={t("form.organizationDisplayName")}
					onChange={debouncedRename}
					value={organizationDisplayName}
				/>

				<ErrorMessage>{nameError as string}</ErrorMessage>
				<div className="h-6">
					{displaySuccess ? (
						<div className="text-green-800 opacity-100 transition-opacity duration-300 ease-in-out">
							{t("form.messages.nameUpdatedSuccessfully")}
						</div>
					) : null}
				</div>
			</div>
			<div className="relative mb-6">
				<Input disabled label={t("form.organizationUniqueName")} value={organization?.uniqueName} />
			</div>

			<Button
				className="gap-3 px-4 text-base font-semibold text-white"
				disabled={organization?.id === user?.defaultOrganizationId}
				onClick={() => openModal(ModalName.deleteOrganization, organization)}
				title={t("form.buttons.deleteOrganizationName", { name: organization?.displayName })}
				variant="outline"
			>
				<TrashIcon className="size-4 stroke-white" />
				{t("form.buttons.deleteOrganization")}
			</Button>
			<DeleteOrganizationModal isDeleting={isLoading.deletingOrganization} onDelete={onDelete} />
		</div>
	);
};
