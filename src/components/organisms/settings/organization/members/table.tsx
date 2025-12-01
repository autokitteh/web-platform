import React, { useEffect, useRef, useState } from "react";

import { CellContext, ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { featureFlags } from "@constants";
import { ModalName } from "@src/enums/components";
import { CreateMemberModalRef } from "@src/interfaces/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { EnrichedMember } from "@src/types/models";
import { cn } from "@src/utilities";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr, Typography } from "@components/atoms";
import { TableTanstack } from "@components/molecules/table";
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
			meta: {
				filterVariant: "search",
			},
		},
		{
			accessorKey: "status",
			header: t("table.headers.status"),
			size: 100,
			cell: ({ row }) => row.original.status,
			meta: {
				filterVariant: "select",
			},
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
						cell: (props: CellContext<EnrichedMember, unknown>) => {
							const { row } = props;
							return (
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
							);
						},
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

			{featureFlags.displayTableTanstack ? (
				isLoading.members ? (
					<Loader isCenter size="md" />
				) : (
					<TableTanstack className="mt-6" columns={columns} data={members || []} />
				)
			) : (
				<Table className="mt-6">
					<THead>
						<Tr>
							<Th
								className={cn("w-1/5 min-w-16 pl-4", {
									"w-1/3": !amIadminCurrentOrganization,
								})}
							>
								{t("table.headers.name")}
							</Th>
							<Th
								className={cn("w-2/6 min-w-16", {
									"w-1/3": !amIadminCurrentOrganization,
								})}
							>
								{t("table.headers.email")}
							</Th>
							<Th
								className={cn("w-1/5 min-w-16", {
									"w-1/6": !amIadminCurrentOrganization,
								})}
							>
								{t("table.headers.status")}
							</Th>
							<Th className="w-1/6 min-w-16">{t("table.headers.role")}</Th>
							{amIadminCurrentOrganization ? (
								<Th className="w-1/8 min-w-16">{t("table.headers.actions")}</Th>
							) : null}
						</Tr>
					</THead>

					{isLoading.members ? (
						<Loader isCenter size="md" />
					) : (
						<TBody>
							{members?.map((member) => (
								<Tr className="hover:bg-gray-1300" key={member.id}>
									<Td
										className={cn("w-1/5 min-w-16 pl-4", {
											"w-1/3": !amIadminCurrentOrganization,
										})}
									>
										{member.name}
									</Td>
									<Td
										className={cn("w-2/6 min-w-16", {
											"w-1/3": !amIadminCurrentOrganization,
										})}
									>
										{member.email}
									</Td>
									<Td
										className={cn("w-1/5 min-w-16 capitalize", {
											"w-1/6": !amIadminCurrentOrganization,
										})}
									>
										{member.status}
									</Td>
									<Td className="w-1/6 min-w-16 capitalize">{member.role}</Td>
									{amIadminCurrentOrganization ? (
										<Td className="w-1/8 min-w-16" innerDivClassName="justify-end">
											<IconButton
												className="mr-1"
												disabled={user?.id === member.id}
												onClick={() =>
													openModal(ModalName.deleteMemberFromOrg, {
														name: member.name,
														id: member.id,
														email: member.email,
													})
												}
												title={t("table.actions.delete", { name: member.name })}
											>
												<TrashIcon className="size-4 stroke-white" />
											</IconButton>
										</Td>
									) : null}
								</Tr>
							))}
						</TBody>
					)}
				</Table>
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
