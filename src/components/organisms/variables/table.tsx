import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useSort } from "@hooks";
import { EnvironmentsService, VariablesService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { Environment, Variable } from "@type/models";

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
					className="capitalize font-semibold gap-1 group hover:text-white p-0 text-gray-300 w-auto"
					href="add"
				>
					<PlusCircle className="duration-300 group-hover:stroke-white h-5 stroke-gray-300 w-5" />

					{t("buttons.addNew")}
				</Button>
			</div>
			{sortedVariables.length ? (
				<Table className="mt-3">
					<THead>
						<Tr>
							<Th className="cursor-pointer font-normal group" onClick={() => requestSort("name")}>
								{t("table.columns.name")}

								<SortButton
									ariaLabel={t("table.buttons.ariaSortByName")}
									className="group-hover:opacity-100 opacity-0"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="cursor-pointer font-normal group" onClick={() => requestSort("value")}>
								{t("table.columns.value")}

								<SortButton
									ariaLabel={t("table.buttons.ariaSortByValue")}
									className="group-hover:opacity-100 opacity-0"
									isActive={"value" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="font-normal max-w-20 text-right">{t("table.columns.actions")}</Th>
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
										<div className="flex gap-2 items-center leading-none">
											<LockSolid className="fill-white h-3 w-3" />

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
											<EditIcon className="fill-white h-3 w-3" />
										</IconButton>

										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteVariable", { name })}
											onClick={() => showDeleteModal(name, value, scopeId)}
										>
											<TrashIcon className="fill-white h-3 w-3" />
										</IconButton>
									</div>
								</Td>
							</Tr>
						))}
					</TBody>
				</Table>
			) : (
				<div className="font-semibold mt-10 text-center text-gray-300 text-xl"> {t("titleNoAvailable")}</div>
			)}

			<DeleteVariableModal onDelete={handleDeleteVariable} variable={deleteVariable!} />
		</>
	);
};
