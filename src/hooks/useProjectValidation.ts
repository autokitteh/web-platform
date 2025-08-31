import { useState, useCallback } from "react";

import { useTranslation } from "react-i18next";

import { Connection, Trigger, Variable } from "@type/models";

export type ProjectValidationLevel = "warning" | "error";

interface ValidationState {
	code: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	connections: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	triggers: {
		level?: ProjectValidationLevel;
		message?: string;
	};
	variables: {
		level?: ProjectValidationLevel;
		message?: string;
	};
}

const defaultProjectValidationState: ValidationState = {
	code: {
		message: "",
		level: "warning",
	},
	connections: {
		message: "",
		level: "warning",
	},
	triggers: {
		message: "",
		level: "warning",
	},
	variables: {
		message: "",
		level: "warning",
	},
};

export const useProjectValidation = () => {
	const { t } = useTranslation("tabs");
	const [projectValidationState, setProjectValidationState] =
		useState<ValidationState>(defaultProjectValidationState);
	const [isValid, setIsValid] = useState(true);

	const checkState = useCallback(
		async (
			projectId: string,
			data?: {
				connections?: Connection[];
				resources?: Record<string, Uint8Array>;
				triggers?: Trigger[];
				variables?: Variable[];
			}
		) => {
			setIsValid(false);
			const newProjectValidationState = { ...projectValidationState };

			if (data?.resources) {
				newProjectValidationState.code = {
					message: !Object.keys(data.resources).length ? t("validation.noCodeAndAssets") : "",
					level: "error",
				};
			}

			if (data?.connections) {
				const notInitiatedConnections = data.connections.filter((c) => c.status !== "ok").length;

				newProjectValidationState.connections = {
					...newProjectValidationState.connections,
					message: notInitiatedConnections > 0 ? t("validation.connectionsNotConfigured") : "",
				};
			}

			if (data?.triggers) {
				newProjectValidationState.triggers = {
					...newProjectValidationState.triggers,
					message: !data.triggers.length ? t("validation.noTriggers") : "",
				};
			}

			if (data?.variables) {
				const isEmptyVarValue = data.variables?.find((varb) => varb.value === "");
				newProjectValidationState.variables = {
					...newProjectValidationState.variables,
					message: isEmptyVarValue ? t("validation.emptyVariable") : "",
				};
			}

			const isInvalid = Object.values(newProjectValidationState).some(
				(error) => !!error.message && error.level === "error"
			);

			setProjectValidationState(newProjectValidationState);
			setIsValid(!isInvalid);

			return;
		},
		[projectValidationState, t]
	);

	return {
		projectValidationState,
		isValid,
		checkState,
	};
};
