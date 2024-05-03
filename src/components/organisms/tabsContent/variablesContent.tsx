import React, { useState, useEffect } from "react";
import { PlusCircle } from "@assets/image";
import { TrashIcon, EditIcon } from "@assets/image/icons";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Toast } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { ModalDeleteVariable } from "@components/organisms/modals";
import { ModalName, SortDirectionVariant } from "@enums/components";
import { VariablesService } from "@services";
import { useModalStore, useProjectStore } from "@store";
import { SortDirection } from "@type/components";
import { Variable } from "@type/models";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const VariablesContent = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "variables" });
	const { t: tErrors } = useTranslation("errors");
	const { openModal, closeModal } = useModalStore();
	const { currentProject, getProjectVariables } = useProjectStore();
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Variable;
	}>({ direction: SortDirectionVariant.ASC, column: "name" });
	const [variables, setVariables] = useState<Variable[]>(currentProject.variables);
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [deleteVariable, setDeleteVariable] = useState<Variable>();
	const navigate = useNavigate();

	const envId = currentProject?.environments?.[0]?.envId;

	const toggleSortVariables = (key: keyof Variable) => {
		const newDirection =
			sort.column === key && sort.direction === SortDirectionVariant.ASC
				? SortDirectionVariant.DESC
				: SortDirectionVariant.ASC;

		const sortedVariables = orderBy(variables, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setVariables(sortedVariables);
	};

	const handleDeleteVariable = async () => {
		const { error } = await VariablesService.delete({
			envId,
			name: deleteVariable!.name,
		});
		closeModal(ModalName.deleteVariable);

		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}

		getProjectVariables();
	};

	useEffect(() => {
		const sortedVariables = orderBy(currentProject.variables, [sort.column], [sort.direction]);
		setVariables(sortedVariables);
	}, [currentProject.variables]);

	const showDeleteModal = (variableName: string, variableValue: string) => {
		openModal(ModalName.deleteVariable);
		setDeleteVariable({ name: variableName, value: variableValue, envId, isSecret: false });
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
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortVariables("name")}>
								{t("table.columns.name")}
								<SortButton
									ariaLabel={t("table.buttons.ariaSortByName")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="cursor-pointer group font-normal border-r-0" onClick={() => toggleSortVariables("value")}>
								{t("table.columns.value")}
								<SortButton
									ariaLabel={t("table.buttons.ariaSortByValue")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"value" === sort.column}
									sortDirection={sort.direction}
								/>
							</Th>
							<Th className="text-right max-w-20">Actions</Th>
						</Tr>
					</THead>
					<TBody>
						{variables.map(({ name, value }, idx) => (
							<Tr className="group" key={idx}>
								<Td className="font-semibold">{name}</Td>
								<Td className="border-r-0">{value}</Td>
								<Td className="max-w-20">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyVariable", { name })}
											onClick={() => navigate(`modify-variable/${envId}/${name}`)}
										>
											<EditIcon className="fill-white w-3 h-3" />
										</IconButton>
										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteVariable", { name })}
											onClick={() => showDeleteModal(name, value)}
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
				<div className="mt-10 text-gray-300 font-semibold text-xl text-center"> {t("titleNoAvailable")}</div>
			)}

			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={tErrors("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>

			<ModalDeleteVariable onDelete={handleDeleteVariable} variable={deleteVariable!} />
		</div>
	);
};
