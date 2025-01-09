import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";

import { Button, IconButton, TBody, THead, Table, Td, Th, Tr, Typography } from "@components/atoms";
import { CreateMemberModal, DeleteMemberModal } from "@components/organisms/settings/organization";

import { RotateRightIcon, TrashIcon } from "@assets/image/icons";

export const OrganizationMembersTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization.members" });
	const { closeModal, openModal } = useModalStore();
	const [isCreating, setIsCreating] = useState(false);
	const { currentOrganizationId, inviteMember, listMembers, membersList } = useOrganizationStore();
	const membersEmails = new Set((membersList || []).map((member) => member.user.email));
	const addToast = useToastStore((state) => state.addToast);

	useEffect(() => {
		listMembers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const createMember = async (email: string) => {
		setIsCreating(true);
		const error = await inviteMember(currentOrganizationId!, email);
		setIsCreating(false);
		closeModal(ModalName.organizationMemberCreate);

		if (error) {
			addToast({
				message: t("errors.inviteFailed"),
				type: "error",
			});

			return;
		}

		addToast({
			message: t("form.memberInvited", { email }),
			type: "success",
		});
	};

	return (
		<div className="w-3/4">
			<Typography className="mb-4 font-bold" element="h2" size="xl">
				{t("title")}
			</Typography>
			<Button
				className="ml-auto border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
				onClick={() => openModal(ModalName.organizationMemberCreate)}
				variant="outline"
			>
				{t("buttons.addMember")}
			</Button>
			<Table className="mt-6">
				<THead>
					<Tr>
						<Th className="w-1/5 min-w-16 pl-4">{t("table.headers.name")}</Th>
						<Th className="w-2/6 min-w-16">{t("table.headers.email")}</Th>
						<Th className="w-1/5 min-w-16">{t("table.headers.status")}</Th>
						<Th className="w-1/6 min-w-16">{t("table.headers.role")}</Th>
						<Th className="w-1/8 min-w-16 justify-end pr-4">{t("table.headers.actions")}</Th>
					</Tr>
				</THead>

				<TBody>
					<Tr className="hover:bg-gray-1300">
						<Td className="w-1/5 min-w-16 cursor-pointer pl-4">xxxx</Td>
						<Td className="w-2/6 min-w-16 cursor-pointer">@mail</Td>
						<Td className="w-1/5 min-w-16 cursor-pointer">Invite sent / active</Td>
						<Td className="w-1/6 min-w-16 cursor-pointer">Admin</Td>
						<Td className="w-1/8 min-w-16 cursor-pointer gap-1">
							<div className="flex">
								<IconButton className="ml-auto mr-1" title={t("table.actions.resendInvite")}>
									<RotateRightIcon className="size-4 fill-white" />
								</IconButton>
								<IconButton
									className="mr-1"
									onClick={() => openModal(ModalName.deleteMemberFromOrg)}
									title={t("table.actions.delete")}
								>
									<TrashIcon className="size-4 stroke-white" />
								</IconButton>
							</div>
						</Td>
					</Tr>
				</TBody>
			</Table>
			<CreateMemberModal createMember={createMember} isCreating={isCreating} membersEmails={membersEmails} />
			<DeleteMemberModal />
		</div>
	);
};
