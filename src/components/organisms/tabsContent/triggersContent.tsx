import React, { useState, useEffect } from "react";
import { PlusCircle, ThreeDots } from "@assets/image";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Toast } from "@components/atoms";
import { SortButton, DropdownButton } from "@components/molecules";
import { ModalDeleteTrigger } from "@components/organisms/modals";
import { fetchMenuInterval, namespaces } from "@constants";
import { EModalName, ESortDirection } from "@enums/components";
import { LoggerService, TriggersService } from "@services";
import { useModalStore } from "@store";
import { SortDirection } from "@type/components";
import { Trigger } from "@type/models";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const TriggersContent = () => {
	const { t: tError } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { openModal, closeModal } = useModalStore();
	const { projectId } = useParams();
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Trigger;
	}>({ direction: ESortDirection.ASC, column: "name" });
	const [triggers, setTriggers] = useState<Trigger[]>([]);
	const [triggerId, setTriggerId] = useState<string>();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const navigate = useNavigate();

	const fetchTriggers = async () => {
		const { data } = await TriggersService.listByProjectId(projectId!);
		if (!data) return;
		setTriggers(data);
	};

	useEffect(() => {
		fetchTriggers();

		const intervalMenu = setInterval(fetchTriggers, fetchMenuInterval);
		return () => clearInterval(intervalMenu);
	}, []);

	const toggleSortTriggers = (key: keyof Trigger) => {
		const newDirection =
			sort.column === key && sort.direction === ESortDirection.ASC ? ESortDirection.DESC : ESortDirection.ASC;

		const sortedConnections = orderBy(triggers, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setTriggers(sortedConnections);
	};

	const handleDeleteTrigger = async () => {
		if (!triggerId) return;

		const { error } = await TriggersService.delete(triggerId);
		closeModal(EModalName.deleteTrigger);
		if (error) {
			setToast({ isOpen: true, message: tError("triggerRemoveFailed") });
			LoggerService.error(
				namespaces.projectUI,
				t("triggerFailedExtended", { triggerId: triggerId, error: (error as Error).message })
			);
			return;
		}
		fetchTriggers();
	};

	return (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button
					className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white"
					href={`add-new-trigger/${projectId}`}
				>
					<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					{t("buttonAddNew")}
				</Button>
			</div>
			{triggers.length ? (
				<Table className="mt-5">
					<THead>
						<Tr>
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortTriggers("connectionName")}>
								{t("table.columns.connection")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"connectionName" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortTriggers("path")}>
								{t("table.columns.call")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"path" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th
								className="cursor-pointer group font-normal border-r-0"
								onClick={() => toggleSortTriggers("eventType")}
							>
								{t("table.columns.eventType")}
								<SortButton
									className="opacity-0 group-hover:opacity-100"
									isActive={"eventType" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="max-w-10 border-0" />
						</Tr>
					</THead>
					<TBody>
						{triggers.map((trigger) => (
							<Tr className="group" key={trigger.triggerId}>
								<Td className="font-semibold">{trigger.connectionName}</Td>
								<Td>
									{trigger.path}:{trigger.name}
								</Td>
								<Td className="border-r-0">{trigger.eventType}</Td>
								<Td className="max-w-10 border-0 pr-1.5 justify-end">
									<DropdownButton
										className="flex-col gap-1"
										contentMenu={
											<>
												<Button
													ariaLabel={t("table.buttons.ariaModifyTrigger", { name: trigger.name })}
													className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white"
													onClick={() => navigate(`modify-trigger/${trigger.triggerId!}`)}
												>
													{t("table.buttons.modify")}
												</Button>
												<Button
													ariaLabel={t("table.buttons.ariaDeleteTrigger", { name: trigger.name })}
													className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white"
													onClick={() => {
														setTriggerId(trigger.triggerId);
														openModal(EModalName.deleteTrigger);
													}}
												>
													{t("table.buttons.delete")}
												</Button>
											</>
										}
									>
										<IconButton className="w-6 h-6 p-1  hover:bg-gray-700">
											<ThreeDots className="w-full h-full transition fill-gray-500 group-hover:fill-white" />
										</IconButton>
									</DropdownButton>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-gray-300 font-semibold text-xl text-center">{t("titleNoAvailable")}</div>
			)}

			<Toast
				className="border-error"
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<p className="font-semibold text-error">{tError("error")}</p>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>

			<ModalDeleteTrigger onDelete={handleDeleteTrigger} triggerId={triggerId} />
		</div>
	);
};
