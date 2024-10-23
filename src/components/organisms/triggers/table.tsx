import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { LoggerService, TriggersService } from "@services";
import { namespaces } from "@src/constants";
import { Trigger } from "@type/models";

import { useSort } from "@hooks";
import { useCacheStore, useModalStore, useToastStore } from "@store";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { EmptyTableAddButton, SortButton } from "@components/molecules";
import { DeleteTriggerModal } from "@components/organisms/triggers";

import { PlusCircle } from "@assets/image";
import { EditIcon, TrashIcon } from "@assets/image/icons";

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

	useEffect(() => {
		fetchTriggers(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleDeleteTrigger = async () => {
		if (!triggerId) {
			return;
		}
		setIsDeleting(true);
		const { error } = await TriggersService.delete(triggerId);
		setIsDeleting(false);

		closeModal(ModalName.deleteTrigger);
		if (error) {
			addToast({
				message: tError("triggerRemoveFailed") + (error as Error).message,
				type: "error",
			});

			return;
		}
		addToast({
			message: t("triggerRemovedSuccessfully"),
			type: "success",
		});
		LoggerService.info(namespaces.ui.triggers, t("triggerRemovedSuccessfullyExtended", { triggerId }));

		fetchTriggers(projectId!, true);
		setTriggerId(undefined);
	};

	const handleOpenModalDeleteTrigger = useCallback(
		(triggerId: string) => {
			setTriggerId(triggerId);
			openModal(ModalName.deleteTrigger);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[triggerId]
	);

	return loadingTriggers ? (
		<Loader isCenter size="xl" />
	) : (
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
							<Th
								className="group w-1/4 cursor-pointer pl-4 font-normal"
								onClick={() => requestSort("name")}
							>
								{t("table.columns.name")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th
								className="group w-1/4 cursor-pointer font-normal"
								onClick={() => requestSort("sourceType")}
							>
								{t("table.columns.connection")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"sourceType" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th
								className="group w-1/4 cursor-pointer font-normal"
								onClick={() => requestSort("entrypoint")}
							>
								{t("table.columns.call")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"entrypoint" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="w-1/4 max-w-20 text-right font-normal">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedTriggers.map((trigger) => (
							<Tr className="group" key={trigger.triggerId}>
								<Td className="w-1/4 pl-4 font-semibold">
									<div className="flex gap-3">
										<div>{trigger.name}</div>
									</div>
								</Td>

								<Td className="w-1/4">
									<span className="capitalize" title={trigger.sourceType}>
										{trigger.sourceType}
									</span>
								</Td>

								<Td className="w-1/4">{trigger.entrypoint}</Td>

								<Td className="w-1/4 max-w-20 pr-0">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyTrigger", {
												name: trigger.name,
											})}
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
