import React, { useEffect, useRef, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { ModalName } from "@src/enums/components";
import { CreateMemberModalRef } from "@src/interfaces/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { EnrichedMember } from "@src/types/models";

import { Button, IconButton, Loader, Typography } from "@components/atoms";
import { TableTanstack } from "@components/atoms/table";
import { CreateMemberModal, DeleteMemberModal } from "@components/organisms/settings/organization";

import { TrashIcon } from "@assets/image/icons";

export const OrganizationMembersTable = () => {
	const { t } = useTranslation("settings", { keyPrefix: "organization.members" });
	const { closeModal, openModal } = useModalStore();
	const {
		inviteMember,
		deleteMember,
		getMembers,
		isLoading,
		getEnrichedMembers,
		user,
		amIadminCurrentOrganization,
		members: membersFromStore,
	} = useOrganizationStore();
	const addToast = useToastStore((state) => state.addToast);
	const modalRef = useRef<CreateMemberModalRef>(null);
	const [members, setMembers] = useState<EnrichedMember[]>();
	const membersEmails = new Set((members || []).map((member) => member.email));

	useEffect(() => {
		const { data, error } = getEnrichedMembers();

		if (error || !data) {
			addToast({
				message: t("errors.getEnrichedMembersFailed"),
				type: "error",
			});
			return;
		}

		setMembers(data);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [membersFromStore]);

	const fetchMembers = async () => {
		const { error } = await getMembers();
		if (error) {
			addToast({
				message: t("errors.getMembersFailed"),
				type: "error",
			});
			return;
		}
	};

	useEffect(() => {
		fetchMembers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const openCreateMemberModal = () => {
		modalRef.current?.resetForm();
		openModal(ModalName.organizationMemberCreate);
	};

	const createMember = async (email: string) => {
		const { error } = await inviteMember(email);
		closeModal(ModalName.organizationMemberCreate);

		if (error) {
			addToast({
				message: t("errors.inviteFailed", { email }),
				type: "error",
			});
			return;
		}

		addToast({
			message: t("form.inviteSucceed", { email }),
			type: "success",
		});

		await getMembers();
	};

	const onDelete = async (userId: string, email: string) => {
		const { error } = await deleteMember(userId);
		closeModal(ModalName.deleteMemberFromOrg);

		if (error) {
			addToast({
				message: t("errors.deleteFailed", { email }),
				type: "success",
			});

			return;
		}

		addToast({
			message: t("form.deleteSucceed", { email }),
			type: "success",
		});
	};

	const columns: ColumnDef<EnrichedMember>[] = [
		{
			accessorKey: "name",
			header: t("table.headers.name"),
			cell: ({ row }) => row.original.name,
		},
		{
			accessorKey: "email",
			header: t("table.headers.email"),
			cell: ({ row }) => row.original.email,
		},
		{
			accessorKey: "status",
			header: t("table.headers.status"),
			size: 100,
			cell: ({ row }) => row.original.status,
		},
		{
			accessorKey: "role",
			header: t("table.headers.role"),
			size: 100,
			cell: ({ row }) => row.original.role,
		},
		...(amIadminCurrentOrganization
			? [
					{
						accessorKey: "actions",
						header: t("table.headers.actions"),
						size: 50,
						cell: ({ row }) => (
							<IconButton
								disabled={user?.id === row.original.id}
								onClick={() =>
									openModal(ModalName.deleteMemberFromOrg, {
										name: row.original.name,
										id: row.original.id,
										email: row.original.email,
									})
								}
								title={t("table.actions.delete", { name: row.original.name })}
							>
								<TrashIcon className="size-4 stroke-white" />
							</IconButton>
						),
					},
				]
			: []),
	];

	return (
		<div className="w-3/4">
			<Typography className="mb-4 font-bold" element="h2" size="xl">
				{t("title")}
			</Typography>
			{amIadminCurrentOrganization ? (
				<Button
					className="ml-auto border-black bg-white px-5 text-base font-medium hover:bg-gray-950 hover:text-white"
					onClick={() => openCreateMemberModal()}
					variant="outline"
				>
					{t("buttons.addMember")}
				</Button>
			) : null}

			{isLoading.members ? (
				<Loader isCenter size="md" />
			) : (
				<TableTanstack className="mt-6" columns={columns} data={members || []} />
			)}

			<CreateMemberModal
				createMember={createMember}
				isCreating={isLoading.inviteMember}
				membersEmails={membersEmails}
				ref={modalRef}
			/>
			<DeleteMemberModal isDeleting={isLoading.deleteMember} onDelete={onDelete} />
		</div>
	);
};
