import React, { useState, useEffect } from "react";
import { PlusCircle } from "@assets/image";
import { TrashIcon, EditIcon, LockSolid } from "@assets/image/icons";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Loader } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteVariableModal } from "@components/organisms/variables";
import { ModalName } from "@enums/components";
import { useSort } from "@hooks";
import { EnvironmentsService, VariablesService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { Environment, Variable } from "@type/models";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const VariablesTable = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "variables" });
	const { t: tErrors } = useTranslation("errors");
	const [isLoadingVariables, setIsLoadingVariables] = useState(true);
	const [variables, setVariables] = useState<Variable[]>([]);
	const [envId, setEnvId] = useState<string>();
	const [deleteVariable, setDeleteVariable] = useState<Variable>();

	const navigate = useNavigate();
	const { projectId } = useParams();
	const { openModal, closeModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { items: sortedVariables, sortConfig, requestSort } = useSort<Variable>(variables, "name");

	const fetchVariables = async () => {
		try {
			const { data: envs, error: errorEnvs } = await EnvironmentsService.listByProjectId(projectId!);
			if (errorEnvs) throw errorEnvs;

			const envId = (envs as Environment[])[0].envId;
			setEnvId(envId);
			const { data: vars, error } = await VariablesService.list(envId);
			if (error) throw error;
			if (!vars) return;

			setVariables(vars);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
		} finally {
			setIsLoadingVariables(false);
		}
	};

	useEffect(() => {
		fetchVariables();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleDeleteVariable = async () => {
		const { error } = await VariablesService.delete({
			scopeId: deleteVariable!.scopeId,
			name: deleteVariable!.name,
		});
		closeModal(ModalName.deleteVariable);

		if (error)
			return addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});

		fetchVariables();
	};

	const showDeleteModal = (variableName: string, variableValue: string, scopeId: string) => {
		openModal(ModalName.deleteVariable);
		setDeleteVariable({ name: variableName, value: variableValue, scopeId, isSecret: false });
	};

	return isLoadingVariables ? (
		<div className="flex flex-col justify-center h-full">
			<Loader />
		</div>
	) : (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button
					ariaLabel={t("buttons.addNew")}
					className="w-auto gap-1 p-0 font-semibold text-gray-300 capitalize group hover:text-white"
					href="add"
				>
					<PlusCircle className="w-5 h-5 duration-300 stroke-gray-300 group-hover:stroke-white" />
					{t("buttons.addNew")}
				</Button>
			</div>
			{sortedVariables.length ? (
				<Table className="mt-5">
					<THead>
						<Tr>
							<Th className="font-normal cursor-pointer group" onClick={() => requestSort("name")}>
								{t("table.columns.name")}
								<SortButton
									ariaLabel={t("table.buttons.ariaSortByName")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th className="font-normal cursor-pointer group" onClick={() => requestSort("value")}>
								{t("table.columns.value")}
								<SortButton
									ariaLabel={t("table.buttons.ariaSortByValue")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"value" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>
							<Th className="font-normal text-right max-w-20">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>
					<TBody>
						{sortedVariables.map(({ name, value, scopeId, isSecret }, idx) => (
							<Tr className="group" key={idx}>
								<Td className="font-semibold">{name}</Td>
								<Td>
									{!isSecret ? (
										value
									) : (
										<div className="flex items-center gap-2 leading-none">
											<LockSolid className="w-3 h-3 fill-white" />
											<span className="pt-2">**********</span>
										</div>
									)}
								</Td>
								<Td className="max-w-20">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyVariable", { name })}
											onClick={() => navigate(`edit/${envId}/${name}`)}
										>
											<EditIcon className="w-3 h-3 fill-white" />
										</IconButton>
										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteVariable", { name })}
											onClick={() => showDeleteModal(name, value, scopeId)}
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
				<div className="mt-10 text-xl font-semibold text-center text-gray-300"> {t("titleNoAvailable")}</div>
			)}

			<DeleteVariableModal onDelete={handleDeleteVariable} variable={deleteVariable!} />
		</div>
	);
};
