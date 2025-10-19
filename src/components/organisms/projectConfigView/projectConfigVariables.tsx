import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { useCacheStore } from "@src/store";
import { Variable } from "@src/types/models/variable.type";

import { Accordion } from "@components/molecules";

export const ProjectConfigVariables = () => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "variables" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const variables = useCacheStore((state) => state.variables);

	const handleEditVariable = useCallback(
		(variableName: string) => {
			navigate(`/projects/${projectId}/variables/edit/${variableName}`);
		},
		[projectId, navigate]
	);

	return (
		<Accordion hideDivider title={`${t("title")} (${variables?.length || 0})`}>
			<div className="space-y-2">
				{variables && variables.length > 0 ? (
					variables.map((variable: Variable) => {
						const hasValue = variable.value && variable.value.trim() !== "";
						return (
							<div
								className="group flex cursor-pointer flex-row items-center gap-1 rounded-lg border border-gray-700 bg-gray-900 p-2 transition hover:border-gray-600"
								id={`variable-${variable.name}`}
								key={variable.name}
								onClick={() => handleEditVariable(variable.name)}
							>
								<div className="flex size-6 items-center justify-center text-sm">⚙️</div>

								<div className="min-w-0 flex-1">
									<div className="truncate font-medium text-white">{variable.name}</div>
								</div>

								<div className="relative w-36">
									<div className="relative flex w-full truncate rounded border border-gray-600 bg-gray-800 py-1 pl-1.5 pr-1 text-xs text-gray-300">
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
							</div>
						);
					})
				) : (
					<div className="text-gray-400">{t("noVariablesFound")}</div>
				)}
			</div>
		</Accordion>
	);
};
