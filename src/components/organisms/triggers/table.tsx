import React, { useCallback, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { LoggerService, TriggersService } from "@services";
import { namespaces } from "@src/constants";
import { TriggerTypes } from "@src/enums";
import { TableHeader } from "@src/interfaces/components";
import { SortableColumns } from "@src/types/components";
import { cn } from "@src/utilities";
import { Trigger } from "@type/models";

import { useSort } from "@hooks";
import { useCacheStore, useModalStore, useToastStore } from "@store";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { EmptyTableAddButton, SortButton } from "@components/molecules";
import { DeleteTriggerModal } from "@components/organisms/triggers";

import { ClockIcon, EditIcon, LinkIcon, PlusCircle, TrashIcon, WebhookIcon } from "@assets/image/icons";

const triggerTypeConfig = {
	[TriggerTypes.connection]: {
		Icon: LinkIcon,
		className: "size-4 fill-white",
	},
	[TriggerTypes.webhook]: {
		Icon: WebhookIcon,
		className: "size-4 stroke-white",
	},
	[TriggerTypes.schedule]: {
		Icon: ClockIcon,
		className: "size-4 stroke-white",
	},
} as const;

const TypeColumn = React.memo(({ sourceType }: { sourceType?: TriggerTypes }) => {
	if (!sourceType || !triggerTypeConfig[sourceType]) {
		return <div />;
	}

	const { Icon, className } = triggerTypeConfig[sourceType];

	return (
		<span className="flex gap-x-2 capitalize" title={sourceType}>
			<Icon className={className} />
			{sourceType}
		</span>
	);
});

TypeColumn.displayName = "TypeColumn";

const useTableHeaders = (t: (key: string) => string): TableHeader[] => {
	return useMemo(
		() => [
			{
				key: "name",
				label: t("table.columns.name"),
				className: "w-4/12 pl-4",
				sortable: true,
			},
			{
				key: "sourceType",
				label: t("table.columns.type"),
				className: "w-2/12",
				sortable: true,
			},
			{
				key: "entrypoint",
				label: t("table.columns.call"),
				className: "w-4/12",
				sortable: true,
			},
			{
				key: "actions",
				label: t("table.columns.actions"),
				className: "w-2/12 text-right",
				sortable: false,
			},
		],
		[t]
	);
};

export const TriggersTable = () => {
	const { t: tError } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { closeModal, openModal } = useModalStore();
	const {
		fetchTriggers,
		loading: { triggers: loadingTriggers },
		triggers,
	} = useCacheStore();
	const [isDeleting, setIsDeleting] = useState(false);
	const [triggerId, setTriggerId] = useState<string>();
	const addToast = useToastStore((state) => state.addToast);
	const { items: sortedTriggers, requestSort, sortConfig } = useSort<Trigger>(triggers, "name");

	const tableHeaders = useTableHeaders(t);

	const handleSort = useCallback(
		(key: SortableColumns) => {
			requestSort(key);
		},
		[requestSort]
	);

	const handleDeleteTrigger = useCallback(async () => {
		if (!triggerId) return;

		setIsDeleting(true);
		try {
			const { error } = await TriggersService.delete(triggerId);
			if (error) throw error;

			addToast({
				message: t("table.triggerRemovedSuccessfully"),
				type: "success",
			});
			LoggerService.info(namespaces.ui.triggers, t("table.triggerRemovedSuccessfullyExtended", { triggerId }));
			fetchTriggers(projectId!, true);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: tError("triggerRemoveFailed"),
				type: "error",
			});
		} finally {
			setIsDeleting(false);
			closeModal(ModalName.deleteTrigger);
			setTriggerId(undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [triggerId, projectId]);

	const handleOpenModalDeleteTrigger = useCallback(
		(id: string) => {
			setTriggerId(id);
			openModal(ModalName.deleteTrigger);
		},
		[openModal]
	);

	const tableHeaderClass = (sortable: boolean, className: string) =>
		cn("group font-normal", { "cursor-pointer": sortable }, className);

	if (loadingTriggers) {
		return <Loader isCenter size="xl" />;
	}

	return (
		<>
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-500">{t("titleAvailable")}</div>
				<Button
					ariaLabel={t("buttons.addNew")}
					className="group w-auto gap-1 p-0 font-semibold capitalize text-gray-500 hover:text-white"
					href="add"
				>
					<PlusCircle className="size-5 stroke-gray-500 duration-300 group-hover:stroke-white" />
					{t("buttons.addNew")}
				</Button>
			</div>

			{triggers.length ? (
				<Table className="mt-2.5">
					<THead>
						<Tr>
							{tableHeaders.map(({ className, key, label, sortable }) => (
								<Th
									className={tableHeaderClass(sortable, className)}
									key={key}
									onClick={() => sortable && key !== "actions" && handleSort(key as SortableColumns)}
								>
									{label}
									{sortable ? (
										<SortButton
											className="opacity-0 group-hover:opacity-100"
											isActive={key === sortConfig.key}
											sortDirection={sortConfig.direction}
										/>
									) : null}
								</Th>
							))}
						</Tr>
					</THead>

					<TBody>
						{sortedTriggers.map((trigger) => (
							<Tr className="group" key={trigger.triggerId}>
								<Td className="w-4/12 pl-4 font-semibold">
									<div className="flex gap-3">
										<div>{trigger.name}</div>
									</div>
								</Td>
								<Td className="w-2/12">
									<TypeColumn sourceType={trigger?.sourceType} />
								</Td>
								<Td className="w-4/12">{trigger.entrypoint}</Td>
								<Td className="w-2/12 pr-0">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyTrigger", {
												name: trigger.name,
											})}
											className="size-8"
											onClick={() => navigate(`${trigger.triggerId}/edit`)}
										>
											<EditIcon className="size-3 fill-white" />
										</IconButton>
										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteTrigger", {
												name: trigger.name,
											})}
											onClick={() => handleOpenModalDeleteTrigger(trigger.triggerId!)}
										>
											<TrashIcon className="size-4 stroke-white" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<EmptyTableAddButton buttonText={t("titleEmptyTriggers")} onClick={() => navigate("add")} />
			)}

			<DeleteTriggerModal id={triggerId} isDeleting={isDeleting} onDelete={handleDeleteTrigger} />
		</>
	);
};
