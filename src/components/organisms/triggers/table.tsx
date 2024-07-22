import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { TriggersService } from "@services";
import { Trigger } from "@type/models";

import { useSort } from "@hooks";
import { useModalStore, useToastStore } from "@store";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteTriggerModal } from "@components/organisms/triggers";

import { PlusCircle } from "@assets/image";
import { ClockIcon, EditIcon, TrashIcon } from "@assets/image/icons";

export const TriggersTable = () => {
	const { t: tError } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { closeModal, openModal } = useModalStore();
	const [isLoading, setIsLoading] = useState(true);

	const [triggers, setTriggers] = useState<Trigger[]>([]);
	const [triggerId, setTriggerId] = useState<string>();
	const addToast = useToastStore((state) => state.addToast);
	const { items: sortedTriggers, requestSort, sortConfig } = useSort<Trigger>(triggers, "name");

	const fetchTriggers = async () => {
		setIsLoading(true);
		try {
			const { data: triggers, error } = await TriggersService.listByProjectId(projectId!);
			if (error) {
				throw error;
			}
			if (!triggers) {
				return;
			}

			setTriggers(triggers);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTriggers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleDeleteTrigger = async () => {
		if (!triggerId) {
			return;
		}

		const { error } = await TriggersService.delete(triggerId);
		closeModal(ModalName.deleteTrigger);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tError("triggerRemoveFailed") + (error as Error).message,
				type: "error",
			});

			return;
		}
		fetchTriggers();
	};

	const handleOpenModalDeleteTrigger = useCallback(
		(triggerId: string) => {
			setTriggerId(triggerId);
			openModal(ModalName.deleteTrigger);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[triggerId]
	);

	const handleNavigate = (triggerId: string, isScheduler: boolean) => {
		const path = isScheduler ? `/edit-scheduler` : `/edit`;
		navigate(`${triggerId}${path}`);
	};

	return isLoading ? (
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
					<PlusCircle className="h-5 w-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

					{t("buttons.addNew")}
				</Button>
			</div>
			{triggers.length ? (
				<Table className="mt-3">
					<THead>
						<Tr>
							<Th className="group cursor-pointer font-normal" onClick={() => requestSort("name")}>
								{t("table.columns.name")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th
								className="group cursor-pointer font-normal"
								onClick={() => requestSort("connectionName")}
							>
								{t("table.columns.connection")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"connectionName" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="group cursor-pointer font-normal" onClick={() => requestSort("path")}>
								{t("table.columns.call")}

								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"path" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="max-w-20 text-right font-normal">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedTriggers.map((trigger) => (
							<Tr className="group" key={trigger.triggerId}>
								<Td className="font-semibold">
									<div className="flex gap-3">
										{trigger.data?.schedule?.string?.v ? (
											<ClockIcon className="w-4 fill-white" />
										) : null}

										<div>{trigger.name}</div>
									</div>
								</Td>

								<Td>{trigger.connectionName}</Td>

								<Td>
									{trigger.path}:{trigger.entryFunction}
								</Td>

								<Td className="max-w-20 pr-0">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyTrigger", {
												name: trigger.name,
											})}
											onClick={() => handleNavigate(trigger.triggerId!, !!trigger.data?.schedule)}
										>
											<EditIcon className="h-3 w-3 fill-white" />
										</IconButton>

										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteTrigger", {
												name: trigger.name,
											})}
											onClick={() => handleOpenModalDeleteTrigger(trigger.triggerId!)}
										>
											<TrashIcon className="h-3 w-3 fill-white" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-center text-xl font-semibold text-gray-500">{t("titleNoAvailable")}</div>
			)}

			<DeleteTriggerModal onDelete={handleDeleteTrigger} triggerId={triggerId} />
		</>
	);
};
