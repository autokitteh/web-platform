import React, { useCallback, useState } from "react";

import debounce from "lodash/debounce";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { validateEntitiesName } from "@src/utilities";

import { Button, ErrorMessage, Input, SuccessMessage, Typography } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";

import { TrashIcon } from "@assets/image/icons";

export const OrganizationSettings = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization" });
	const { organizationId } = useParams();
	const [nameError, setNameError] = useState("");
	const { currentOrganization, updateOrganization, organizationsList, deleteOrganization } = useOrganizationStore();
	const [displaySuccess, setDisplaySuccess] = useState(false);
	const { openModal, closeModal } = useModalStore();
	const [isDeleting, setIsDeleting] = useState(false);
	const [organizationDisplayName, setOrganizationDisplayName] = useState<string>(
		currentOrganization?.displayName || ""
	);

	const addToast = useToastStore((state) => state.addToast);

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
		setDisplaySuccess(true);
		setTimeout(() => {
			setDisplaySuccess(false);
		}, 3000);
	};

	const onDelete = async () => {
		setIsDeleting(true);
		const error = await deleteOrganization(currentOrganization);
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
				<div className="h-6">
					{displaySuccess ? (
						<SuccessMessage>{t("form.messages.nameUpdatedSuccessfully")}</SuccessMessage>
					) : null}
				</div>
			</div>
			<div className="relative mb-6">
				<Input disabled label={t("form.organizationUniqueName")} />{" "}
			</div>

			<Button
				className="gap-3 px-4 text-base font-semibold text-white"
				onClick={() =>
					openModal(ModalName.deleteOrganization, {
						id: currentOrganization?.id,
						name: currentOrganization?.displayName,
					})
				}
				variant="outline"
			>
				<TrashIcon className="size-4 stroke-white" />
				{t("form.buttons.deleteOrganization")}
			</Button>
			<DeleteOrganizationModal isDeleting={isDeleting} onDelete={onDelete} />
		</div>
	);
};
