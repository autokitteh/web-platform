import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PlusCircle } from "@assets/image";
import { EditIcon, TrashIcon } from "@assets/image/icons";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Toast } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { ModalDeleteTrigger } from "@components/organisms/modals";
import { ModalName, SortDirectionVariant } from "@enums/components";
import { TriggersService } from "@services";
import { useModalStore } from "@store";
import { SortDirection } from "@type/components";
import { Trigger } from "@type/models";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const TriggersTable = () => {
	const { t: tError } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal, closeModal } = useModalStore();
	const [isLoading, setIsLoading] = useState(true);

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

	const fetchTriggers = async () => {
		setIsLoading(true);
		try {
			const { data: triggers, error } = await TriggersService.listByProjectId(projectId!);
			if (error) throw error;
			if (!triggers) return;

			setTriggers(triggers);
		} catch (err) {
			setToast({ isOpen: true, message: (err as Error).message });
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchTriggers();
	}, [projectId]);

	const handleToggleSort = (key: keyof Trigger) => {
		const newDirection =
			sort.column === key && sort.direction === SortDirectionVariant.ASC
				? SortDirectionVariant.DESC
				: SortDirectionVariant.ASC;
		setSort({ direction: newDirection, column: key });
	};

	const sortedTriggers = useMemo(() => {
		return orderBy(triggers, [sort.column], [sort.direction]);
	}, [triggers, sort.column, sort.direction]);

	const handleDeleteTrigger = async () => {
		if (!triggerId) return;

		const { error } = await TriggersService.delete(triggerId);
		closeModal(ModalName.deleteTrigger);
		if (error) {
			setToast({ isOpen: true, message: tError("triggerRemoveFailed") });
			return;
		}
		fetchTriggers();
	};

	const handleOpenModalDeleteTrigger = useCallback(
		(triggerId: string) => {
			setTriggerId(triggerId);
			openModal(ModalName.deleteTrigger);
		},
		[triggerId]
	);

	return isLoading ? (
		<div className="flex flex-col justify-center h-full text-xl font-semibold text-center">
			{t("buttons.loading")}...
		</div>
	) : (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button className="w-auto gap-1 p-0 font-semibold text-gray-300 capitalize group hover:text-white" href="add">
					<PlusCircle className="w-5 h-5 duration-300 stroke-gray-300 group-hover:stroke-white" />
					{t("buttons.addNew")}
				</Button>
			</div>
			{triggers.length ? (
				<Table className="mt-5">
					<THead>
						<Tr>
							<Th className="font-normal cursor-pointer group" onClick={() => handleToggleSort("name")}>
								{t("table.columns.name")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group" onClick={() => handleToggleSort("connectionName")}>
								{t("table.columns.connection")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"connectionName" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group" onClick={() => handleToggleSort("path")}>
								{t("table.columns.call")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"path" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group" onClick={() => handleToggleSort("eventType")}>
								{t("table.columns.eventType")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"eventType" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group" onClick={() => handleToggleSort("filter")}>
								{t("table.columns.filter")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"filter" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="font-normal text-right max-w-20">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>
					<TBody>
						{sortedTriggers.map((trigger) => (
							<Tr className="group" key={trigger.triggerId}>
								<Td className="font-semibold">{trigger.name}</Td>
								<Td className="font-semibold">{trigger.connectionName}</Td>
								<Td>
									{trigger.path}:{trigger.entryFunction}
								</Td>
								<Td>{trigger.eventType}</Td>
								<Td>{trigger.filter}</Td>
								<Td className="max-w-20">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyTrigger", { name: trigger.name })}
											onClick={() => navigate(`modify-trigger/${trigger.triggerId!}`)}
										>
											<EditIcon className="w-3 h-3 fill-white" />
										</IconButton>
										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteTrigger", { name: trigger.name })}
											onClick={() => handleOpenModalDeleteTrigger(trigger.triggerId!)}
										>
											<TrashIcon className="w-3 h-3 fill-white" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-xl font-semibold text-center text-gray-300">{t("titleNoAvailable")}</div>
			)}

			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={tError("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>

			<ModalDeleteTrigger onDelete={handleDeleteTrigger} triggerId={triggerId} />
		</div>
	);
};
