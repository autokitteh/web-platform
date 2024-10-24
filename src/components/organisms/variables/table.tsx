import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { LoggerService, VariablesService } from "@services";
import { namespaces } from "@src/constants";
import { Variable } from "@type/models";

import { useSort } from "@hooks";
import { useCacheStore, useModalStore, useToastStore } from "@store";

import { Button, IconButton, Loader, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { EmptyTableAddButton, SortButton } from "@components/molecules";
import { DeleteVariableModal } from "@components/organisms/variables";

import { PlusCircle } from "@assets/image";
import { EditIcon, LockSolid, TrashIcon } from "@assets/image/icons";

export const VariablesTable = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "variables" });
	const { t: tErrors } = useTranslation("tabs", { keyPrefix: "variables" });
	const [deleteVariable, setDeleteVariable] = useState<Variable>();
	const [isDeleting, setIsDeleting] = useState(false);
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { closeModal, openModal } = useModalStore();
	const {
		envId,
		fetchVariables,
		loading: { variables: loadingVariables },
		variables,
	} = useCacheStore();
	const addToast = useToastStore((state) => state.addToast);
	const { items: sortedVariables, requestSort, sortConfig } = useSort<Variable>(variables, "name");

	const loadVariables = async (projectId: string, force?: boolean) => {
		try {
			await fetchVariables(projectId, force);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			addToast({
				message: tErrors("errorFetchingVariables"),
				type: "error",
			});
		}
	};

	useEffect(() => {
		loadVariables(projectId!);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	const handleDeleteVariable = async () => {
		setIsDeleting(true);
		const { error } = await VariablesService.delete({
			name: deleteVariable!.name,
			scopeId: deleteVariable!.scopeId!,
		});
		setIsDeleting(false);
		closeModal(ModalName.deleteVariable);

		if (error) {
			return addToast({
				message: (error as Error).message,
				type: "error",
			});
		}
		addToast({
			message: t("variableRemovedSuccessfully", { variableName: deleteVariable!.name }),
			type: "success",
		});
		LoggerService.info(
			namespaces.ui.variables,
			t("variableRemovedSuccessfullyExtended", {
				variableName: deleteVariable!.name,
				variableId: deleteVariable!.name,
			})
		);

		setDeleteVariable(undefined);

		loadVariables(projectId!, true);
	};

	const showDeleteModal = (variableName: string, variableValue: string, scopeId: string) => {
		openModal(ModalName.deleteVariable);
		setDeleteVariable({ isSecret: false, name: variableName, scopeId, value: variableValue });
	};

	return loadingVariables ? (
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
			{sortedVariables.length ? (
				<Table className="mt-2.5">
					<THead>
						<Tr>
							<Th
								className="group w-2/6 cursor-pointer pl-4 font-normal"
								onClick={() => requestSort("name")}
							>
								{t("table.columns.name")}

								<SortButton
									ariaLabel={t("table.buttons.ariaSortByName")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"name" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="group w-3/6 cursor-pointer font-normal" onClick={() => requestSort("value")}>
								{t("table.columns.value")}

								<SortButton
									ariaLabel={t("table.buttons.ariaSortByValue")}
									className="opacity-0 group-hover:opacity-100"
									isActive={"value" === sortConfig.key}
									sortDirection={sortConfig.direction}
								/>
							</Th>

							<Th className="w-1/6 max-w-20 text-right font-normal">{t("table.columns.actions")}</Th>
						</Tr>
					</THead>

					<TBody>
						{sortedVariables.map(({ isSecret, name, scopeId, value }, index) => (
							<Tr className="group" key={index}>
								<Td className="w-2/6 pl-4 font-semibold">{name}</Td>

								<Td className="w-3/6">
									{!isSecret ? (
										value
									) : (
										<div className="flex items-center gap-2 leading-none">
											<LockSolid className="size-3 fill-white" />

											<span className="pt-2">**********</span>
										</div>
									)}
								</Td>

								<Td className="w-1/6 max-w-20 pr-0">
									<div className="flex size-8 space-x-1">
										<IconButton
											ariaLabel={t("table.buttons.ariaModifyVariable", { name })}
											onClick={() => navigate(`edit/${envId}/${name}`)}
										>
											<EditIcon className="size-3 fill-white" />
										</IconButton>

										<IconButton
											ariaLabel={t("table.buttons.ariaDeleteVariable", { name })}
											onClick={() => showDeleteModal(name, value, scopeId!)}
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
				<EmptyTableAddButton buttonText={t("titleEmptyVariablesButton")} onClick={() => navigate("add")} />
			)}

			<DeleteVariableModal id={deleteVariable?.name} isDeleting={isDeleting} onDelete={handleDeleteVariable} />
		</>
	);
};
