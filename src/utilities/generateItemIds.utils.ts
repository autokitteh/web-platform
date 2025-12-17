import { ItemIds } from "@src/interfaces/utilities";

export const generateItemIds = (itemId: string, type: "variable" | "trigger" | "connection"): ItemIds => {
	const suffix = type === "variable" ? "variable" : type === "trigger" ? "trigger" : "connection";

	return {
		containerId: `${itemId}-${suffix}-container`,
		displayId: `${itemId}-${suffix}-display`,
		valueId: type === "variable" ? `${itemId}-${suffix}-value` : undefined,
		actionsContainerId: `${itemId}-${suffix}-actions-container`,
		modifyButtonId: `${itemId}-${suffix}-set-button`,
		configureButtonId: `${itemId}-${suffix}-configure-button`,
		showEventsButtonId: `${itemId}-${suffix}-show-events-button`,
		deleteButtonId: `${itemId}-${suffix}-delete-button`,
		webhookUrlButtonId: type === "trigger" ? `${itemId}-${suffix}-webhook-url-button` : undefined,
	};
};
