import React, { useCallback, useMemo, useState } from "react";

import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore, useUserStore } from "@src/store";
import { validateEntitiesName } from "@src/utilities";

import { Button, ErrorMessage, Input, Typography } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";

import { TrashIcon } from "@assets/image/icons";

export const OrganizationSettings = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const { organizationId } = useParams();
	const [nameError, setNameError] = useState("");
	const { currentOrganization, updateOrganization, organizationsList, deleteOrganization } = useOrganizationStore();
	const { user } = useUserStore();
	const [displaySuccess, setDisplaySuccess] = useState(false);
	const { openModal, closeModal } = useModalStore();
	const [isDeleting, setIsDeleting] = useState(false);
	const [organizationDisplayName, setOrganizationDisplayName] = useState<string>(
		currentOrganization?.displayName || ""
	);
	const organizationsNames = useMemo(
		() => new Set((organizationsList || []).map((organization) => organization.displayName)),
		[organizationsList]
	);
	const navigate = useNavigate();

	const addToast = useToastStore((state) => state.addToast);

	const renameOrganization = (event: React.ChangeEvent<HTMLInputElement>) => {
		const displayName = event.target.value;
		if (!displayName) {
			setNameError(t("form.errors.nameRequired"));
			return;
		}
		const isNameInvalid = validateEntitiesName(displayName, organizationsNames);
		if (isNameInvalid) {
			setNameError(isNameInvalid);
			return;
		}
		setNameError("");
		setOrganizationDisplayName(displayName);
		updateOrganization({ ...currentOrganization!, displayName });
		setDisplaySuccess(true);
		setTimeout(() => {
			setDisplaySuccess(false);
		}, 3000);
	};

	const onDelete = async () => {
		setIsDeleting(true);
		const error = await deleteOrganization(currentOrganization!);
		setIsDeleting(false);
		closeModal(ModalName.deleteOrganization);

		if (error) {
			addToast({
				message: error as string,
				type: "error",
			});

			return;
		}

		addToast({
			message: t("form.messages.organizationDeleted", { name: currentOrganization?.displayName }),
			type: "success",
		});
		setTimeout(() => {
			if (!user?.defaultOrganizationId) {
				LoggerService.error(
					namespaces.ui.organizationSettings,
					t("errors.defaultOrganizationIdMissing", { userId: user?.id })
				);
				navigate(`/`);
				return;
			}
			navigate(`/switch-organization/${user.defaultOrganizationId}`);
		}, 3000);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedRename = useCallback(debounce(renameOrganization, 2000), [organizationId]);

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
				<div className="h-6">
					{displaySuccess ? (
						<div className="text-green-800 opacity-100 transition-opacity duration-300 ease-in-out">
							{t("form.messages.nameUpdatedSuccessfully")}
						</div>
					) : null}
				</div>
			</div>
			<div className="relative mb-6">
				<Input disabled label={t("form.organizationUniqueName")} value={currentOrganization?.uniqueName} />
			</div>

			<Button
				className="gap-3 px-4 text-base font-semibold text-white"
				disabled={currentOrganization?.id === user?.defaultOrganizationId}
				onClick={() =>
					openModal(ModalName.deleteOrganization, {
						id: currentOrganization?.id,
						name: currentOrganization?.displayName,
					})
				}
				title={t("form.buttons.deleteOrganizationName", { name: currentOrganization?.displayName })}
				variant="outline"
			>
				<TrashIcon className="size-4 stroke-white" />
				{t("form.buttons.deleteOrganization")}
			</Button>
			<DeleteOrganizationModal isDeleting={isDeleting} onDelete={onDelete} />
		</div>
	);
};
