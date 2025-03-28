import React from "react";

import omit from "lodash/omit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";

import { Button, Typography, IconButton, TBody, THead, Table, Td, Th, Tr, Loader } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";

import { TrashIcon } from "@assets/image/icons";

export const UserOrganizationsTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });
	const { closeModal, openModal } = useModalStore();
	const {
		enrichedOrganizations,
		currentOrganization,
		user,
		deleteOrganization,
		isLoading,
		logoutFunction,
		amIadminCurrentOrganization,
	} = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();

	const onDelete = async (organization: EnrichedOrganization) => {
		const deletingCurrentOrganization = organization.id === currentOrganization?.id;

		const { error } = await deleteOrganization(omit(organization, "currentMember"));
		closeModal(ModalName.deleteOrganization);
		if (error) {
			addToast({
				message: t("errors.deleteFailed", {
					name: organization?.displayName,
					organizationId: organization?.id,
				}),
				type: "error",
			});
		}

		addToast({
			message: t("table.messages.organizationDeleted", { name: organization.displayName }),
			type: "success",
		});

		if (!deletingCurrentOrganization) return;
		setTimeout(async () => {
			if (!user?.defaultOrganizationId) {
				LoggerService.error(
					namespaces.ui.organizationTableUserSettings,
					t("errors.defaultOrganizationIdMissing", { userId: user?.id })
				);
				logoutFunction(true);
				return;
			}
			navigate(`/switch-organization/${user.defaultOrganizationId}`);
		}, 3000);
	};

	const isNameInputDisabled = (organizationId: string, amIadminCurrentOrganization?: boolean): boolean =>
		!!(
			isLoading.updatingOrganization ||
			user?.defaultOrganizationId === organizationId ||
			!amIadminCurrentOrganization
		);

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

				{isLoading.organizations ? (
					<Loader isCenter size="md" />
				) : (
					<TBody>
						{enrichedOrganizations ? (
							enrichedOrganizations.map((organization) => (
								<Tr className="hover:bg-gray-1300" key={organization.id}>
									<Td className="w-2/6 min-w-32 pl-4">{organization.displayName}</Td>
									<Td className="w-2/6 min-w-32">{organization.uniqueName}</Td>
									<Td className="w-1/6 min-w-32 capitalize">{organization.currentMember?.role}</Td>
									<Td className="w-1/6 min-w-32 capitalize">{organization.currentMember?.status}</Td>
									<Td className="w-1/6 min-w-16">
										<IconButton
											className="mr-1"
											disabled={isNameInputDisabled(organization.id, amIadminCurrentOrganization)}
											onClick={() => openModal(ModalName.deleteOrganization, organization)}
											title={t("table.actions.delete", { name: organization.displayName })}
										>
											<TrashIcon className="size-4 stroke-white" />
										</IconButton>
									</Td>
								</Tr>
							))
						) : (
							<div className="mt-10 text-center text-xl font-semibold">
								{t("table.errors.noOrganizationsFound")}
							</div>
						)}
					</TBody>
				)}
			</Table>
			<DeleteOrganizationModal isDeleting={isLoading.deletingOrganization} onDelete={onDelete} />
		</div>
	);
};
