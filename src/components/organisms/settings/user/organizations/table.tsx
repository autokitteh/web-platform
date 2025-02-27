import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@src/enums/components";
import { useDeleteOrganization } from "@src/hooks";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";

import { Button, Typography, IconButton, TBody, THead, Table, Td, Th, Tr, Loader } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";
import { WarningDeleteOrganizationModal } from "@components/organisms/settings/user/organizations";

import { TrashIcon } from "@assets/image/icons";

export const UserOrganizationsTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });
	const { enrichedOrganizations, user, isLoading, amIadminCurrentOrganization } = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();
	const { onDelete, organizationIdInDeletion, handleDeleteOrganization } = useDeleteOrganization();
	const { closeModal, openModal } = useModalStore();

	const isNameInputDisabled = (organizationId: string): boolean =>
		!!(
			isLoading.updatingOrganization ||
			user?.defaultOrganizationId === organizationId ||
			!amIadminCurrentOrganization ||
			organizationIdInDeletion
		);

	const deleteOrganization = async (organization: EnrichedOrganization) => {
		const { error } = await onDelete(organization);
		closeModal(ModalName.deleteOrganization);
		if (error) {
			addToast({
				message: t("errors.deleteFailed", {
					name: organization?.displayName,
					organizationId: organization?.id,
				}),
				type: "error",
			});

			return;
		}
		addToast({
			message: t("table.messages.organizationDeleted", { name: organization.displayName }),
			type: "success",
		});
	};

	const onClickDeleteOrganization = async (organization: EnrichedOrganization) => {
		const result = await handleDeleteOrganization(organization);
		if (result.status === "error") {
			addToast({
				message: t("errors.deleteFailed", {
					name: result.organization?.displayName,
					organizationId: result.organization?.id,
				}),
				type: "error",
			});

			return;
		}
		if (result.action === "show_warning") {
			openModal(ModalName.warningDeleteOrganization, { name: result.organization.displayName });

			return;
		}
		openModal(ModalName.deleteOrganization, result.organization);
	};

	return (
		<div className="w-3/4">
			<Typography className="mb-9 font-averta font-bold" element="h1" size="2xl">
				{t("title")}
			</Typography>
			<Button
				className="ml-auto border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
				onClick={() => navigate("/settings/add-organization")}
				variant="outline"
			>
				{t("buttons.addOrganization")}
			</Button>
			<Table className="mt-6">
				<THead>
					<Tr>
						<Th className="w-2/6 min-w-32 pl-4">{t("table.headers.name")}</Th>
						<Th className="w-2/6 min-w-32">{t("table.headers.uniqueName")}</Th>
						<Th className="w-1/6 min-w-32">{t("table.headers.role")}</Th>
						<Th className="w-1/6 min-w-32">{t("table.headers.status")}</Th>
						<Th className="w-1/6 min-w-16">{t("table.headers.actions")}</Th>
					</Tr>
				</THead>

				<TBody>
					{enrichedOrganizations?.map((organization) => (
						<Tr className="hover:bg-gray-1300" key={organization.id}>
							<Td className="w-2/6 min-w-32 pl-4">{organization.displayName}</Td>
							<Td className="w-2/6 min-w-32">{organization.uniqueName}</Td>
							<Td className="w-1/6 min-w-32 capitalize">{organization.currentMember?.role}</Td>
							<Td className="w-1/6 min-w-32 capitalize">{organization.currentMember?.status}</Td>
							<Td className="w-1/6 min-w-16">
								<IconButton
									className="mr-1"
									disabled={isNameInputDisabled(organization.id)}
									onClick={async () => onClickDeleteOrganization(organization)}
									title={t("table.actions.delete", { name: organization.displayName })}
								>
									{organizationIdInDeletion === organization.id ? (
										<Loader size="sm" />
									) : (
										<TrashIcon className="size-4 stroke-white" />
									)}
								</IconButton>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
			<DeleteOrganizationModal
				isDeleting={isLoading.deletingOrganization}
				onDelete={(organization) => deleteOrganization(organization)}
			/>
			<WarningDeleteOrganizationModal />
		</div>
	);
};
