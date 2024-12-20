import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { useModalStore } from "@src/store";

import { Button, IconButton, TBody, THead, Table, Td, Th, Tr, Typography } from "@components/atoms";
import {
	DeleteUserFromOrganizationModal,
	OrganizationUserCreateModal,
} from "@components/organisms/settings/organization";

import { RotateRightIcon, TrashIcon } from "@assets/image/icons";

export const OrganizationUsers = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization.users" });
	const { openModal } = useModalStore();

	return (
		<div className="w-3/4">
			<Typography className="mb-4 font-bold" element="h2" size="xl">
				{t("title")}
			</Typography>
			<Button
				className="ml-auto border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
				onClick={() => openModal(ModalName.organizationUserCreate)}
				variant="outline"
			>
				{t("buttons.addUser")}
			</Button>
			<Table className="mt-6">
				<THead>
					<Tr>
						<Th className="w-1/4 pl-4 font-normal">{t("table.headers.name")}</Th>
						<Th className="w-1/4 pl-4 font-normal">{t("table.headers.email")}</Th>
						<Th className="w-1/4 pl-4 font-normal">{t("table.headers.status")}</Th>
						<Th className="w-1/4 pl-4 font-normal">{t("table.headers.role")}</Th>
						<Th className="w-1/4 justify-end pr-4 font-normal">{t("table.headers.actions")}</Th>
					</Tr>
				</THead>

				<TBody>
					<Tr className="hover:bg-gray-1300">
						<Td className="w-1/4 cursor-pointer pl-4">xxxx</Td>
						<Td className="w-1/4 cursor-pointer pl-4">@mail</Td>
						<Td className="w-1/4 cursor-pointer pl-4">Invite sent / active</Td>
						<Td className="w-1/4 cursor-pointer pl-4">Admin</Td>
						<Td className="w-1/4 cursor-pointer gap-1">
							<div className="flex">
								<IconButton className="ml-auto mr-1" title={t("table.actions.resendInvite")}>
									<RotateRightIcon className="size-4 fill-white" />
								</IconButton>
								<IconButton
									className="mr-1"
									onClick={() => openModal(ModalName.deleteUserFromOrg)}
									title={t("table.actions.delete")}
								>
									<TrashIcon className="size-4 stroke-white" />
								</IconButton>
							</div>
						</Td>
					</Tr>
				</TBody>
			</Table>
			<OrganizationUserCreateModal />
			<DeleteUserFromOrganizationModal />
		</div>
	);
};
