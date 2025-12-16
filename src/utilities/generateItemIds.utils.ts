import { ItemIds } from "@src/interfaces/utilities";
import { Entity } from "@src/types/entities.type";

export const generateItemIds = (itemId: string, type: Entity): ItemIds => {
	const suffix = type;

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

export const getItemId = (itemId: string, type: Entity, key: keyof ItemIds): string => {
	const itemIds = generateItemIds(itemId, type);
	return itemIds[key] ?? "";
};
