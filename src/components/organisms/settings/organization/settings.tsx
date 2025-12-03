import React, { useMemo, useState } from "react";

import { debounce, omit } from "radash";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { MemberRole } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { isNameEmpty, isNameExist } from "@src/utilities";

import { Button, ErrorMessage, Input, SuccessMessage, Typography } from "@components/atoms";
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
		currentOrganization,
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
	const debouncedRename = debounce({ delay: 2000 }, renameOrganization);

	if (!organization) {
		return null;
	}

	const onDelete = async () => {
		const deletingCurrentOrganization = organization.id === currentOrganization?.id;

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
			if (!deletingCurrentOrganization) return;

			if (!user?.defaultOrganizationId) {
				LoggerService.error(
					namespaces.ui.organizationSettings,
					t("errors.defaultOrganizationIdMissing", { userId: user?.id })
				);
				logoutFunction(true);
				return;
			}
			navigate(`/switch-organization/${user.defaultOrganizationId}`);
		}, 3000);
	};

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
