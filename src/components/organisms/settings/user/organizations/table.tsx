import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { MemberRole } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore, useUserStore } from "@src/store";

import { Button, Typography, IconButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/organization";

import { TrashIcon } from "@assets/image/icons";

export const UserOrganizationsTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });
	const { closeModal, openModal } = useModalStore();
	const [isDeleting, setIsDeleting] = useState(false);
	const { currentOrganization, organizationsList, getOrganizationsList, deleteOrganization, getMember } =
		useOrganizationStore();
	const { user } = useUserStore();
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();
	const [organizationsWhereTheUserIsAdmin, setOrganizationsWhereTheUserIsAdmin] = useState<string[]>([]);

	const checkWhichOrganizationsUserIsAdmin = async () => {
		const organizationsWhereIsAdmin = organizationsList!
			.filter(async (organization) => {
				const { data: usersMember } = await getMember(user!.id, organization.id);
				return usersMember?.role === MemberRole.admin;
			})
			.map((organization) => organization.id);

		setOrganizationsWhereTheUserIsAdmin(organizationsWhereIsAdmin);
	};

	useEffect(() => {
		if (!user || !organizationsList) {
			return;
		}
		checkWhichOrganizationsUserIsAdmin();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, organizationsList]);

	useEffect(() => {
		getOrganizationsList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onDelete = async (organizationId: string, organizationName: string) => {
		setIsDeleting(true);
		const error = await deleteOrganization(organizationId);
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
			message: t("table.messages.organizationDeleted", { name: organizationName }),
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
										currentOrganization?.id === organization.id ||
										organizationsWhereTheUserIsAdmin.includes(organization.id)
									}
									onClick={() => openModal(ModalName.deleteOrganization, organization.displayName)}
									title={t("table.actions.delete", { name: organization.displayName })}
								>
									<TrashIcon className="size-4 stroke-white" />
								</IconButton>
							</Td>
						</Tr>
					))}
				</TBody>
			</Table>
			<DeleteOrganizationModal isDeleting={isDeleting} onDelete={onDelete} />
		</div>
	);
};
