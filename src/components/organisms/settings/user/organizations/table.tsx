import React, { useEffect, useState } from "react";

import omit from "lodash/omit";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { MemberRole } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";

import { Button, Typography, IconButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";

import { TrashIcon } from "@assets/image/icons";

export const UserOrganizationsTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });
	const { closeModal, openModal } = useModalStore();
	const { organizations, getOrganizations, getEnrichedOrganizations, user, deleteOrganization, isLoading } =
		useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();
	const [organizationsList, setOrganizationsList] = useState<EnrichedOrganization[]>();

	useEffect(() => {
		getOrganizations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const { data: latestOrganizations, error } = getEnrichedOrganizations();
		if (error || !latestOrganizations) {
			addToast({
				message: t("errors.fetchFailed"),
				type: "error",
			});
			return;
		}
		setOrganizationsList(latestOrganizations);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [organizations]);

	const onDelete = async (organization: EnrichedOrganization) => {
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
	};

	return (
		<div className="w-3/4">
			<Typography className="mb-9 font-averta font-bold" element="h1" size="2xl">
				{t("title")}
			</Typography>
			<Button
				className="ml-auto border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
				onClick={() => navigate("/organization-settings/add")}
				variant="outline"
			>
				{t("buttons.addOrganization")}
			</Button>
			<Table className="mt-6">
				<THead>
					<Tr>
						<Th className="w-2/5 min-w-32 pl-4">{t("table.headers.name")}</Th>
						<Th className="w-2/5 min-w-32">{t("table.headers.uniqueName")}</Th>
						<Th className="w-1/5 min-w-16 pr-4">{t("table.headers.actions")}</Th>
					</Tr>
				</THead>

				<TBody>
					{organizationsList?.map((organization) => (
						<Tr className="hover:bg-gray-1300" key={organization.id}>
							<Td className="w-2/5 min-w-32 pl-4">{organization.displayName}</Td>
							<Td className="w-2/5 min-w-32">{organization.uniqueName}</Td>
							<Td className="w-1/5 min-w-16">
								<IconButton
									className="mr-1"
									disabled={
										user?.defaultOrganizationId === organization.id ||
										organization.currentMember?.role !== MemberRole.admin
									}
									onClick={() => openModal(ModalName.deleteOrganization, organization)}
									title={t("table.actions.delete", { name: organization.displayName })}
								>
									<TrashIcon className="size-4 stroke-white" />
								</IconButton>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
			<DeleteOrganizationModal isDeleting={isLoading.deletingOrganization} onDelete={onDelete} />
		</div>
	);
};
