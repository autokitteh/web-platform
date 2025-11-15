import { t } from "i18next";

import { namespaces } from "@constants";
import { LoggerService } from "@services/logger.service";
import { LoggerLevel } from "@src/enums/output.enum";
import {
	CreateClickStepParams,
	CreateContentStepParams,
	CreateRenderClickStepParams,
	CreateRenderClickStepWithLoggingParams,
	CreateRenderStepParams,
	CreateRenderStepWithActionParams,
} from "@src/interfaces/store/utilities/tour.utilities.interface";

export const createClickStep = ({
	htmlElementId,
	id,
	titleKey,
	contentKey,
	buttonLabelKey,
	buttonAriaLabelKey,
	options = {},
}: CreateClickStepParams) => ({
	htmlElementId,
	id,
	title: t(titleKey, { ns: "tour" }),
	content: t(contentKey, { ns: "tour" }),
	placement: options.placement || ("bottom" as const),
	highlight: options.highlight ?? true,
	pathPatterns: options.pathPatterns || [/^\/projects\/[^/]+\/explorer$/],
	actionButton: {
		execute: () => {
			const element = document.getElementById(htmlElementId);
			if (!element) {
				LoggerService.debug(
					namespaces.tourWalktrough,
					t("errors.tourStepMissing", { ns: "tour", id: htmlElementId }),
					LoggerLevel.error
				);
				return;
			}
			element.click();
		},
		label: t(buttonLabelKey, { ns: "tour" }),
		ariaLabel: t(buttonAriaLabelKey, { ns: "tour" }),
	},
});
export const createRenderClickStep = ({
	htmlElementId,
	id,
	titleKey,
	renderContent,
	buttonLabelKey,
	buttonAriaLabelKey,
	options = {},
}: CreateRenderClickStepParams) => ({
	htmlElementId,
	id,
	title: t(titleKey, { ns: "tour" }),
	renderContent,
	placement: options.placement || ("bottom" as const),
	highlight: options.highlight ?? true,
	pathPatterns: options.pathPatterns || [/^\/projects\/[^/]+\/explorer$/],
	actionButton: {
		execute: () => document.getElementById(htmlElementId)?.click(),
		label: t(buttonLabelKey, { ns: "tour" }),
		ariaLabel: t(buttonAriaLabelKey, { ns: "tour" }),
	},
});
export const createRenderClickStepWithLogging = ({
	htmlElementId,
	id,
	titleKey,
	renderContent,
	buttonLabelKey,
	buttonAriaLabelKey,
	options = {},
}: CreateRenderClickStepWithLoggingParams) => ({
	htmlElementId,
	id,
	title: t(titleKey, { ns: "tour" }),
	renderContent,
	placement: options.placement || ("bottom" as const),
	highlight: options.highlight ?? false,
	pathPatterns: options.pathPatterns || [/^\/projects\/[^/]+\/explorer$/],
	actionButton: {
		execute: () => {
			const element = document.getElementById(htmlElementId);
			if (!element) {
				LoggerService.debug(
					namespaces.tourWalktrough,
					t("errors.tourStepMissing", { ns: "tour", id: htmlElementId })
				);
				return;
			}
			element.click();
		},
		label: t(buttonLabelKey, { ns: "tour" }),
		ariaLabel: t(buttonAriaLabelKey, { ns: "tour" }),
	},
});
export const createRenderStepWithAction = ({
	htmlElementId,
	id,
	titleKey,
	renderContent,
	buttonLabelKey,
	buttonAriaLabelKey,
	executeAction,
	options = {},
}: CreateRenderStepWithActionParams) => ({
	htmlElementId,
	id,
	title: t(titleKey, { ns: "tour" }),
	renderContent,
	placement: options.placement || ("bottom" as const),
	highlight: options.highlight ?? false,
	pathPatterns: options.pathPatterns || [/^\/projects\/[^/]+\/explorer$/],
	actionButton: {
		execute: executeAction,
		label: t(buttonLabelKey, { ns: "tour" }),
		ariaLabel: t(buttonAriaLabelKey, { ns: "tour" }),
	},
});
export const createContentStep = ({
	htmlElementId,
	id,
	titleKey,
	contentKey,
	options = {},
}: CreateContentStepParams) => ({
	htmlElementId,
	id,
	title: t(titleKey, { ns: "tour" }),
	content: t(contentKey, { ns: "tour" }),
	placement: options.placement || ("bottom" as const),
	highlight: options.highlight ?? true,
	pathPatterns: options.pathPatterns || [/^\/projects\/[^/]+\/explorer$/],
});
export const createRenderStep = ({ htmlElementId, id, titleKey, renderContent, options }: CreateRenderStepParams) => ({
	htmlElementId,
	id,
	title: t(titleKey, { ns: "tour" }),
	renderContent,
	placement: options.placement || ("bottom" as const),
	highlight: options.highlight ?? false,
	pathPatterns: options.pathPatterns || [/^\/projects\/[^/]+\/connections$/],
	...(options.hideBack ? { hideBack: true } : {}),
});
