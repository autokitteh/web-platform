import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { EnvironmentsService, VariablesService } from "@services";
import { Environment, Variable } from "@type/models";

import { useSort } from "@hooks";
import { useModalStore, useToastStore } from "@store";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeleteVariableModal } from "@components/organisms/variables";

import { PlusCircle } from "@assets/image";
import { EditIcon, LockSolid, TrashIcon } from "@assets/image/icons";

export const VariablesTable = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "variables" });
	const [isLoadingVariables, setIsLoadingVariables] = useState(true);
	const [variables, setVariables] = useState<Variable[]>([]);
	const [envId, setEnvId] = useState<string>();
	const [deleteVariable, setDeleteVariable] = useState<Variable>();

	const navigate = useNavigate();
	const { projectId } = useParams();
	const { closeModal, openModal } = useModalStore();
	const addToast = useToastStore((state) => state.addToast);
	const { items: sortedVariables, requestSort, sortConfig } = useSort<Variable>(variables, "name");

	const fetchVariables = async () => {
		try {
			const { data: envs, error: errorEnvs } = await EnvironmentsService.listByProjectId(projectId!);
			if (errorEnvs) {
				throw errorEnvs;
			}

			const envId = (envs as Environment[])[0].envId;
			setEnvId(envId);
			const { data: vars, error } = await VariablesService.list(envId);
			if (error) {
				throw error;
			}
			if (!vars) {
				return;
			}

			setVariables(vars);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
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
			name: deleteVariable!.name,
			scopeId: deleteVariable!.scopeId,
		});
		closeModal(ModalName.deleteVariable);

		if (error) {
			return addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
			});
		}

		fetchVariables();
	};

	const showDeleteModal = (variableName: string, variableValue: string, scopeId: string) => {
		openModal(ModalName.deleteVariable);
		setDeleteVariable({ isSecret: false, name: variableName, scopeId, value: variableValue });
	};

	return isLoadingVariables ? (
		<Loader isCenter size="xl" />
	) : (
		<>
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>

				<Button
					ariaLabel={t("buttons.addNew")}
					className="group w-auto gap-1 p-0 font-semibold capitalize text-gray-300 hover:text-white"
					href="add"
				>
					<PlusCircle className="h-5 w-5 stroke-gray-300 duration-300 group-hover:stroke-white" />

					{t("buttons.addNew")}
				</Button>
			</div>
			{sortedVariables.length ? (
				<Table className="mt-3">
					<THead>
						<Tr>
							<Th className="group cursor-pointer font-normal" onClick={() => requestSort("name")}>
								{t("table.columns.name")}

								<SortButton
									ariaLabel={t("table.buttons.ariaSortByName")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="group cursor-pointer font-normal" onClick={() => requestSort("value")}>
								{t("table.columns.value")}

								<SortButton
									ariaLabel={t("table.buttons.ariaSortByValue")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"value" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="max-w-20 text-right font-normal">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedVariables.map(({ isSecret, name, scopeId, value }, index) => (
							<Tr className="group" key={index}>
								<Td className="font-semibold">{name}</Td>

								<Td>
									{!isSecret ? (
										value
									) : (
										<div className="flex items-center gap-2 leading-none">
											<LockSolid className="h-3 w-3 fill-white" />

											<span className="pt-2">**********</span>
										</div>
									)}
								</Td>

								<Td className="max-w-20 pr-0">
									<div className="flex space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyVariable", { name })}
											onClick={() => navigate(`edit/${envId}/${name}`)}
										>
											<EditIcon className="h-3 w-3 fill-white" />
										</IconButton>

										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteVariable", { name })}
											onClick={() => showDeleteModal(name, value, scopeId)}
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
				<div className="mt-10 text-center text-xl font-semibold text-gray-300"> {t("titleNoAvailable")}</div>
			)}

			<DeleteVariableModal onDelete={handleDeleteVariable} variable={deleteVariable!} />
		</>
	);
};
