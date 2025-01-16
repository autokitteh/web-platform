import React, { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { CreateMemberModalRef } from "@src/interfaces/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";

import { Button, IconButton, TBody, THead, Table, Td, Th, Tr, Typography } from "@components/atoms";
import { CreateMemberModal, RemoveMemberModal } from "@components/organisms/settings/organization";

import { RotateRightIcon, TrashIcon } from "@assets/image/icons";

export const OrganizationMembersTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization.members" });
	const { closeModal, openModal } = useModalStore();
	const [isCreating, setIsCreating] = useState(false);
	const [isRemoving, setIsRemoving] = useState(false);
	const { inviteMember, listMembers, membersList, removeMember } = useOrganizationStore();
	const membersEmails = new Set((membersList || []).map((member) => member.user.email));
	const addToast = useToastStore((state) => state.addToast);
	const modalRef = useRef<CreateMemberModalRef>(null);

	useEffect(() => {
		listMembers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openCreateMemberModal = () => {
		modalRef.current?.resetForm();
		openModal(ModalName.organizationMemberCreate);
	};

	const createMember = async (email: string) => {
		setIsCreating(true);
		const error = await inviteMember(email);
		setIsCreating(false);
		closeModal(ModalName.organizationMemberCreate);

		if (error) {
			return;
		}

		addToast({
			message: t("form.memberInvited", { email }),
			type: "success",
		});
	};

	const onRemove = async (userId: string, email: string) => {
		setIsRemoving(true);
		const error = await removeMember(userId);
		setIsRemoving(false);
		closeModal(ModalName.organizationMemberCreate);

		if (error) {
			return;
		}

		addToast({
			message: t("table.messages.memberRemoved", { email }),
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
				onClick={() => openCreateMemberModal()}
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
									<TrashIcon
										className="size-4 stroke-white"
										onClick={() =>
											openModal(ModalName.deleteMember, { userId: "userId", email: "email" })
										}
									/>
								</IconButton>
							</div>
						</Td>
					</Tr>
				</TBody>
			</Table>
			<CreateMemberModal
				createMember={createMember}
				isCreating={isCreating}
				membersEmails={membersEmails}
				ref={modalRef}
			/>
			<RemoveMemberModal isRemoving={isRemoving} onRemove={onRemove} />
		</div>
	);
};
