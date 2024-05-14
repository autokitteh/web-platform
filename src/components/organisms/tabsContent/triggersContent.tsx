import React, { useState, useEffect, useMemo } from "react";
import { PlusCircle } from "@assets/image";
import { EditIcon, TrashIcon } from "@assets/image/icons";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Toast } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { ModalDeleteTrigger } from "@components/organisms/modals";
import { ModalName, SortDirectionVariant } from "@enums/components";
import { TriggersService } from "@services";
import { useModalStore, useProjectStore } from "@store";
import { SortDirection } from "@type/components";
import { Trigger } from "@type/models";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const TriggersContent = () => {
	const { t: tError } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { openModal, closeModal } = useModalStore();
	const { currentProject, getProjectTriggers } = useProjectStore();
	const navigate = useNavigate();

	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Trigger;
	}>({ direction: SortDirectionVariant.ASC, column: "name" });
	const [triggers, setTriggers] = useState<Trigger[]>([]);

	const [triggerId, setTriggerId] = useState<string>();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	useEffect(() => {
		// TODO: in future - fetch triggers from the backend, not use zustand store, also change for variable, connections and code&assets
		const fetchTriggers = async () => {
			await getProjectTriggers();
			setTriggers(currentProject.triggers);
		};
		fetchTriggers();
	}, []);

	const handleToggleSort = (key: keyof Trigger) => {
		const newDirection =
			sort.column === key && sort.direction === SortDirectionVariant.ASC
				? SortDirectionVariant.DESC
				: SortDirectionVariant.ASC;
		setSort({ direction: newDirection, column: key });
	};

	const sortedTriggers = useMemo(() => {
		return orderBy(currentProject.triggers, [sort.column], [sort.direction]);
	}, [currentProject.triggers, sort.column, sort.direction]);

	const handleDeleteTrigger = async () => {
		if (!triggerId) return;

		const { error } = await TriggersService.delete(triggerId);
		closeModal(ModalName.deleteTrigger);
		if (error) {
			setToast({ isOpen: true, message: tError("triggerRemoveFailed") });
			return;
		}
		await getProjectTriggers();
	};

	const handleOpenDeleteTriggerModal = (triggerId: string) => {
		setTriggerId(triggerId);
		openModal(ModalName.deleteTrigger);
	};

	return (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button
					className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white"
					href="add-new-trigger"
				>
					<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					{t("buttonAddNew")}
				</Button>
			</div>
			{triggers.length ? (
				<Table className="mt-5">
					<THead>
						<Tr>
							<Th className="cursor-pointer group font-normal" onClick={() => handleToggleSort("connectionName")}>
								{t("table.columns.connection")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"connectionName" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="cursor-pointer group font-normal" onClick={() => handleToggleSort("path")}>
								{t("table.columns.call")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"path" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="cursor-pointer group font-normal border-r-0" onClick={() => handleToggleSort("eventType")}>
								{t("table.columns.eventType")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"eventType" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="cursor-pointer group font-normal" onClick={() => handleToggleSort("filter")}>
								{t("table.columns.filter")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"filter" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="text-right font-normal max-w-20">Actions</Th>
						</Tr>
					</THead>
					<TBody>
						{sortedTriggers.map((trigger) => (
							<Tr className="group" key={trigger.triggerId}>
								<Td className="font-semibold">{trigger.connectionName}</Td>
								<Td>
									{trigger.path}:{trigger.name}
								</Td>
								<Td>{trigger.eventType}</Td>
								<Td>{trigger.filter}</Td>
								<Td className="max-w-20">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyTrigger", { name: trigger.name })}
											onClick={() => navigate(`modify-trigger/${trigger.triggerId!}`)}
										>
											<EditIcon className="fill-white w-3 h-3" />
										</IconButton>
										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteTrigger", { name: trigger.name })}
											onClick={() => handleOpenDeleteTriggerModal(trigger.triggerId!)}
										>
											<TrashIcon className="fill-white w-3 h-3" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-gray-300 font-semibold text-xl text-center">{t("titleNoAvailable")}</div>
			)}

			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={t("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>

			<ModalDeleteTrigger onDelete={handleDeleteTrigger} triggerId={triggerId} />
		</div>
	);
};
