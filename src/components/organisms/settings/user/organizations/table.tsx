import React from "react";

import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import { useModalStore, useOrganizationStore, useToastStore } from "@src/store";
import { EnrichedOrganization } from "@src/types/models";

import { Button, Typography, IconButton, Loader } from "@components/atoms";
import { TableTanstack } from "@components/atoms/table";
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
		const { error } = await deleteOrganization(organization);
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

	const handleBulkDelete = async (selectedOrganizations: EnrichedOrganization[]) => {
		for (const organization of selectedOrganizations) {
			const { error } = await deleteOrganization(organization);
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
		}

		addToast({
			message: t("table.messages.organizationsDeleted", { count: selectedOrganizations.length }),
			type: "success",
		});

		const deletingCurrentOrganization = selectedOrganizations.some((org) => org.id === currentOrganization?.id);
		if (deletingCurrentOrganization && user?.defaultOrganizationId) {
			setTimeout(() => {
				navigate(`/switch-organization/${user.defaultOrganizationId}`);
			}, 3000);
		}
	};

	const columns: ColumnDef<EnrichedOrganization>[] = [
		{
			accessorKey: "displayName",
			header: t("table.headers.name"),
			size: 200,
			cell: ({ row }) => row.original.displayName,
		},
		{
			accessorKey: "uniqueName",
			header: t("table.headers.uniqueName"),
			size: 200,
			cell: ({ row }) => row.original.uniqueName,
		},
		{
			accessorKey: "currentMember.role",
			header: t("table.headers.role"),
			size: 100,
			cell: ({ row }) => row.original.currentMember?.role,
		},
		{
			accessorKey: "currentMember.status",
			header: t("table.headers.status"),
			size: 100,
			cell: ({ row }) => row.original.currentMember?.status,
		},
		{
			id: "actions",
			header: t("table.headers.actions"),
			size: 40,
			cell: ({ row }) => {
				const isDisabled =
					isLoading.updatingOrganization ||
					user?.defaultOrganizationId === row.original.id ||
					!amIadminCurrentOrganization;

				return (
					<IconButton
						className="mr-1"
						disabled={isDisabled}
						onClick={() => openModal(ModalName.deleteOrganization, row.original)}
						title={t("table.actions.delete", { name: row.original.displayName })}
					>
						<TrashIcon className="size-4 stroke-white" />
					</IconButton>
				);
			},
		},
	];

	const actionConfig = [
		{
			label: t("table.actions.deleteSelected"),
			onClick: handleBulkDelete,
		},
	];

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
			{isLoading.organizations ? (
				<Loader isCenter size="md" />
			) : (
				<TableTanstack
					actionConfig={actionConfig}
					className="mt-3"
					columns={columns}
					data={enrichedOrganizations || []}
				/>
			)}
			<DeleteOrganizationModal isDeleting={isLoading.deletingOrganization} onDelete={onDelete} />
		</div>
	);
};
