import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useModalStore, useCacheStore } from "@src/store";
import { ProjectValidationLevel } from "@src/types";
import { Variable } from "@src/types/models/variable.type";
import { cn } from "@src/utilities";

import { Button, IconButton, IconSvg } from "@components/atoms";
import { Accordion, DropdownButton } from "@components/molecules";

import { MoreIcon } from "@assets/image";
import { CirclePlusIcon, EditIcon, TrashIcon, VariableCodeIcon } from "@assets/image/icons";

interface ProjectSettingsVariablesProps {
	onOperation?: (type: "connection" | "variable" | "trigger", action: "add" | "edit" | "delete", id?: string) => void;
	validation?: {
		level?: ProjectValidationLevel;
		message?: string;
	};
}

export const ProjectSettingsVariables = ({ onOperation, validation }: ProjectSettingsVariablesProps) => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "variables" });
	const { t: tVariables } = useTranslation("tabs", { keyPrefix: "variables" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();
	const variables = useCacheStore((state) => state.variables);

	const handleDeleteVariable = useCallback(
		(variableName: string) => {
			if (onOperation) {
				onOperation("variable", "delete", variableName);
			} else {
				openModal(ModalName.deleteVariable, variableName);
			}
		},
		[onOperation, openModal]
	);

	const handleEditVariable = useCallback(
		(variableName: string) => {
			if (onOperation) {
				onOperation("variable", "edit", variableName);
			} else {
				navigate(`/projects/${projectId}/variables/edit/${variableName}`);
			}
		},
		[onOperation, projectId, navigate]
	);

	const handleAddVariable = useCallback(() => {
		if (onOperation) {
			onOperation("variable", "add");
		} else {
			navigate(`/projects/${projectId}/variables/add`);
		}
	}, [onOperation, projectId, navigate]);

	const validationColor = validation?.message
		? validation?.level === "error"
			? "text-red-500"
			: validation?.level === "warning"
				? "text-yellow-500"
				: "text-green-500"
		: "";

	const validationClass = validation?.message ? cn(validationColor, "mb-2 text-sm") : "";
	return (
		<Accordion
			className="w-full"
			closeIcon={VariableCodeIcon}
			hideDivider
			openIcon={VariableCodeIcon}
			title={`${t("title")} (${variables?.length || 0})`}
		>
			{validation?.level && validation?.message ? (
				<div className={validationClass}>{validation.message}</div>
			) : null}
			<div className="space-y-2">
				{variables && variables.length > 0 ? (
					variables.map((variable: Variable) => {
						const hasValue = variable.value && variable.value.trim() !== "";
						return (
							<div
								className="group relative flex flex-row items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 p-2"
								id={`variable-${variable.name}`}
								key={variable.name}
							>
								<div className="flex size-6 items-center justify-center text-sm">⚙️</div>

								<div className="ml-0.5 min-w-0 flex-1">
									<div className="truncate font-medium text-white">{variable.name}</div>
									<div className="flex text-xs text-gray-400">
										<span className="truncate">{variable.value || t("notSet")}</span>
									</div>
								</div>

								<div className="flex size-6 items-center justify-center text-sm">
									{hasValue ? (
										<span className="text-green-500">✓</span>
									) : (
										<span className="text-red-500">✗</span>
									)}
								</div>

								<DropdownButton
									ariaLabel={tVariables("table.buttons.ariaModifyVariable", { name: variable.name })}
									contentMenu={
										<div className="flex flex-col gap-1">
											<button
												aria-label={tVariables("table.buttons.ariaModifyVariable", {
													name: variable.name,
												})}
												className="ml-0.5 flex h-8 w-160 items-center gap-2 justify-self-auto px-1 hover:text-green-800"
												onClick={() => handleEditVariable(variable.name)}
												type="button"
											>
												<EditIcon className="size-3 fill-white" />
												<span className="text-sm">{t("actions.edit")}</span>
											</button>
											<button
												aria-label={tVariables("table.buttons.ariaDeleteVariable", {
													name: variable.name,
												})}
												className="flex h-8 w-160 items-center gap-2 justify-self-auto px-1 hover:text-green-800"
												onClick={() => handleDeleteVariable(variable.name)}
												type="button"
											>
												<TrashIcon className="size-4 stroke-white" />
												<span className="text-sm">{t("actions.delete")}</span>
											</button>
										</div>
									}
								>
									<IconButton ariaLabel={t("actions.more")} className="size-8">
										<IconSvg
											className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
											size="md"
											src={MoreIcon}
										/>
									</IconButton>
								</DropdownButton>
							</div>
						);
					})
				) : (
					<div className="text-gray-400">{t("noVariablesFound")}</div>
				)}
				<div className="flex w-full justify-end">
					<Button
						ariaLabel="Add Variable"
						className="group !p-0 hover:bg-transparent hover:font-semibold"
						onClick={handleAddVariable}
					>
						<CirclePlusIcon className="size-3 stroke-green-800 stroke-[1.225] transition-all group-hover:stroke-[2]" />
						<span className="text-sm text-green-800">Add</span>
					</Button>
				</div>
			</div>
		</Accordion>
	);
};
