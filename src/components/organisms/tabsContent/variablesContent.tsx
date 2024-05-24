import React, { useState, useMemo, useEffect } from "react";
import { PlusCircle } from "@assets/image";
import { TrashIcon, EditIcon, LockClassicIcon } from "@assets/image/icons";
import { Table, THead, TBody, Tr, Td, Th, IconButton, Button, Toast } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { ModalDeleteVariable } from "@components/organisms/modals";
import { ModalName, SortDirectionVariant } from "@enums/components";
import { EnvironmentsService, VariablesService } from "@services";
import { useModalStore } from "@store";
import { SortDirection } from "@type/components";
import { Environment, Variable } from "@type/models";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const VariablesContent = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "variables" });
	const { t: tErrors } = useTranslation("errors");
	const [isLoadingVariables, setIsLoadingVariables] = useState(true);
	const [variables, setVariables] = useState<Variable[]>();
	const [envId, setEnvId] = useState<string>();
	const { openModal, closeModal } = useModalStore();
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Variable;
	}>({ direction: SortDirectionVariant.ASC, column: "name" });
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const [deleteVariable, setDeleteVariable] = useState<Variable>();
	const navigate = useNavigate();
	const { projectId } = useParams();

	const fetchVariables = async () => {
		try {
			const { data: envs, error: errorEnvs } = await EnvironmentsService.listByProjectId(projectId!);
			if (errorEnvs) throw errorEnvs;

			const envId = (envs as Environment[])[0].envId;
			setEnvId(envId);
			const { data: vars, error } = await VariablesService.list(envId);
			if (error) throw error;
			setVariables(vars);
		} catch (error) {
			setToast({ isOpen: true, message: (error as Error).message });
		} finally {
			setIsLoadingVariables(false);
		}
	};

	useEffect(() => {
		fetchVariables();
	}, []);

	const toggleSortVariables = (key: keyof Variable) => {
		const newDirection =
			sort.column === key && sort.direction === SortDirectionVariant.ASC
				? SortDirectionVariant.DESC
				: SortDirectionVariant.ASC;

		setSort({ direction: newDirection, column: key });
	};

	const sortedVariables = useMemo(() => {
		return orderBy(variables, [sort.column], [sort.direction]);
	}, [variables, sort.column, sort.direction]);

	const handleDeleteVariable = async () => {
		const { error } = await VariablesService.delete({
			scopeId: deleteVariable!.scopeId,
			name: deleteVariable!.name,
		});
		closeModal(ModalName.deleteVariable);

		if (error) return setToast({ isOpen: true, message: (error as Error).message });

		fetchVariables();
	};

	const showDeleteModal = (variableName: string, variableValue: string, scopeId: string) => {
		openModal(ModalName.deleteVariable);
		setDeleteVariable({ name: variableName, value: variableValue, scopeId, isSecret: false });
	};

	return isLoadingVariables ? (
		<div className="font-semibold text-xl text-center flex flex-col h-full justify-center">
			{t("buttons.loading")}...
		</div>
	) : (
		<div className="pt-14">
			<div className="flex items-center justify-between">
				<div className="text-base text-gray-300">{t("titleAvailable")}</div>
				<Button
					ariaLabel={t("buttons.addNew")}
					className="w-auto group gap-1 p-0 capitalize font-semibold text-gray-300 hover:text-white"
					href="add-new-variable"
				>
					<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
					{t("buttons.addNew")}
				</Button>
			</div>
			{sortedVariables.length ? (
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
							<Th className="cursor-pointer group font-normal" onClick={() => toggleSortVariables("value")}>
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
						{sortedVariables.map(({ name, value, scopeId, isSecret }, idx) => (
							<Tr className="group" key={idx}>
								<Td className="font-semibold">{name}</Td>
								<Td>
									{!isSecret ? (
										value
									) : (
										<div className="flex items-center gap-2 leading-none">
											<LockClassicIcon className="w-3 h-3 fill-white" />
											<span className="pt-2">**********</span>
										</div>
									)}
								</Td>
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
											onClick={() => showDeleteModal(name, value, scopeId)}
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
