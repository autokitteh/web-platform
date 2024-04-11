import React, { useState } from "react";
import { PlusCircle, ThreeDots } from "@assets/image";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Toast } from "@components/atoms";
import { SortButton, DropdownButton } from "@components/molecules";
import { ModalDeleteVariable } from "@components/organisms/modals";
import { EModalName, ESortDirection } from "@enums/components";
import { VariablesService } from "@services";
import { useModalStore, useProjectStore } from "@store";
import { TSortDirection } from "@type/components";
import { TVariable } from "@type/models";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const VariablesContent = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "variables" });
	const { t: tError } = useTranslation("errors");
	const { openModal, closeModal } = useModalStore();
	const { currentProject, getProjectVariables, setProjectModifyVariable } = useProjectStore();
	const [sort, setSort] = useState<{
		direction: TSortDirection;
		column: keyof TVariable;
	}>({ direction: ESortDirection.ASC, column: "name" });
	const [variables, setVariables] = useState<TVariable[]>(currentProject.variables);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const navigate = useNavigate();

	const toggleSortTriggers = (key: keyof TVariable) => {
		const newDirection =
			sort.column === key && sort.direction === ESortDirection.ASC ? ESortDirection.DESC : ESortDirection.ASC;

		const sortedConnections = orderBy(variables, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setVariables(sortedConnections);
	};

	const handleDeleteVariable = async () => {
		if (!currentProject.activeModifyVariable) return;

		const envId = currentProject.environments[0].envId;
		const variableName = currentProject.activeModifyVariable.name;

		const { error } = await VariablesService.delete({
			envId,
			name: variableName,
		});
		closeModal(EModalName.deleteVariable);

		if (error as Error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}

		getProjectVariables();
	};

	const handleModifyVariable = async (name: string, value: string, href?: string) => {
		setProjectModifyVariable(name, value);
		href && navigate(href);
	};

	return (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button
					ariaLabel={t("buttonAddNew")}
					className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white"
					href="add-new-variable"
				>
					<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					{t("buttonAddNew")}
				</Button>
			</div>
			{variables.length ? (
				<Table className="mt-5">
					<THead>
						<Tr>
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortTriggers("name")}>
								{t("table.columns.name")}
								<SortButton
									ariaLabel={t("table.buttons.ariaSortByName")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="cursor-pointer group font-normal border-r-0" onClick={() => toggleSortTriggers("value")}>
								{t("table.columns.value")}
								<SortButton
									ariaLabel={t("table.buttons.ariaSortByValue")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"value" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="max-w-10 border-0" />
						</Tr>
					</THead>
					<TBody>
						{variables.map(({ name, value }, idx) => (
							<Tr className="group" key={idx}>
								<Td className="font-semibold">{name}</Td>
								<Td className="border-r-0">{value}</Td>
								<Td className="max-w-10 border-0 pr-1.5 justify-end">
									<DropdownButton
										ariaLabel={t("table.buttons.ariaVariableOptions")}
										className="flex-col gap-1"
										contentMenu={
											<>
												<Button
													ariaLabel={t("table.buttons.ariaModifyVariable", { name })}
													className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white"
													onClick={() => handleModifyVariable(name, value, "modify-variable")}
												>
													{t("table.buttons.modify")}
												</Button>
												<Button
													ariaLabel={t("table.buttons.ariaDeleteVariable", { name })}
													className="px-4 py-1.5 hover:bg-gray-700 rounded-md text-white"
													onClick={() => {
														openModal(EModalName.deleteVariable);
														handleModifyVariable(name, value);
													}}
												>
													{t("table.buttons.delete")}
												</Button>
											</>
										}
									>
										<IconButton className="w-6 h-6 p-1 hover:bg-gray-700">
											<ThreeDots className="w-full h-full transition fill-gray-500 group-hover:fill-white" />
										</IconButton>
									</DropdownButton>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="mt-10 text-gray-300 font-semibold text-xl text-center"> {t("titleNoAvailable")}</div>
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

			<ModalDeleteVariable onDelete={handleDeleteVariable} />
		</div>
	);
};
