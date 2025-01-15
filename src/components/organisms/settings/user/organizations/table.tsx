import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";

import { Button, Typography, IconButton, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { DeleteOrganizationModal } from "@components/organisms/settings/user/organizations";

import { TrashIcon } from "@assets/image/icons";

export const UserOrganizationsTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "userOrganizations" });
	const { closeModal, openModal } = useModalStore();
	const [isDeleting, setIsDeleting] = useState(false);
	const { organizationsList, getOrganizationsList, setOrganizationsList, deleteOrganization } =
		useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const navigate = useNavigate();

	const fetchOrganizations = async () => {
		const organizationFetchError = await getOrganizationsList();
		if (organizationFetchError) {
			addToast({
				message: t("errors.fetchError"),
				type: "error",
			});
			setOrganizationsList([]);
		}
	};

	useEffect(() => {
		fetchOrganizations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onDelete = async (organizationId: string, organizationName: string) => {
		setIsDeleting(true);
		const error = await deleteOrganization(organizationId);
		setIsDeleting(false);
		closeModal(ModalName.deleteOrganization);

		if (error) {
			addToast({
				message: new Error(error as string).message,
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
						<Th className="w-1/5 min-w-16 pl-4">{t("table.headers.id")}</Th>
						<Th className="w-2/6 min-w-16">{t("table.headers.name")}</Th>
						<Th className="w-1/5 min-w-16">{t("table.headers.uniqueName")}</Th>
						<Th className="w-1/8 min-w-16 justify-end pr-4">{t("table.headers.actions")}</Th>
					</Tr>
				</THead>

				<TBody>
					{organizationsList?.map((organization) => (
						<Tr className="hover:bg-gray-1300" key={organization.id}>
							<Td className="w-1/5 min-w-16 pl-4">{organization.displayName}</Td>
							<Td className="w-2/6 min-w-16">{organization.displayName}</Td>
							<Td className="w-1/8 min-w-16" innerDivClassName="justify-end">
								<IconButton
									className="mr-1"
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
