import { useTranslation } from "react-i18next";

import { ErrorCodes } from "@src/enums/errorCodes.enum";
import { ProjectActionType, MetadataResult } from "@src/types/components";

export const useProjectMetadataHandler = () => {
	const { t } = useTranslation(["projects", "errors"]);

	const handleMetadata = (metadata: any, actionType: ProjectActionType): MetadataResult => {
		if (!metadata) return { handled: false };

		switch (metadata.code) {
			case ErrorCodes.lintFailed: {
				if ("errors" in metadata.payload) {
					const { errors, warnings } = metadata.payload;
					if (errors > 0 && warnings > 0) {
						return {
							handled: true,
							message: t(`topbar.${actionType}FailedWithErrorsAndWarnings`, {
								errorCount: errors,
								warningCount: warnings,
							}),
							type: "error",
						};
					} else if (errors > 0) {
						return {
							handled: true,
							message: t("topbar.lintErrors", { count: errors }),
							type: "error",
						};
					} else if (warnings > 0 && actionType === "deploy") {
						return {
							handled: true,
							message: t("topbar.lintWarnings", { count: warnings }),
							type: "warning",
						};
					}
				}
				return { handled: true };
			}

			case ErrorCodes.buildFailed: {
				const { warnings, errors } = metadata.payload;
				return {
					handled: true,
					message: t("topbar.buildFailedWithErrorsAndWarnings", {
						warningCount: warnings,
						errorCount: errors,
					}),
					type: "error",
				};
			}

			case ErrorCodes.deployFailed: {
				const { warnings } = metadata.payload;
				if (warnings > 0) {
					return {
						handled: true,
						message: t("topbar.deployFailedWithErrorsAndWarnings", {
							errorCount: 0,
							warningCount: warnings,
						}),
						type: "error",
					};
				} else {
					return {
						handled: true,
						message: t("topbar.projectDeployFailed"),
						type: "error",
					};
				}
			}

			case ErrorCodes.buildSucceed: {
				const { warnings } = metadata.payload;
				if (warnings > 0) {
					return {
						handled: true,
						message: t(`topbar.${actionType}SuccessWithWarnings`, { count: warnings }),
						type: "warning",
					};
				} else if (actionType === "build") {
					return {
						handled: true,
						message: t("topbar.buildSuccess"),
						type: "success",
					};
				}
				return { handled: true };
			}

			case ErrorCodes.deploySucceed: {
				const { warnings } = metadata.payload;
				if (warnings > 0) {
					return {
						handled: true,
						message: t(`topbar.${actionType}SuccessWithWarnings`, { count: warnings }),
						type: "warning",
					};
				}
				return { handled: true };
			}
		}

		return { handled: false };
	};

	return { handleMetadata };
};
