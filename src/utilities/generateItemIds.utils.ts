import { ItemIds } from "@src/interfaces/utilities";
import { Entity } from "@src/types/entities.type";

export const generateItemIds = (itemId: string, type: Entity): ItemIds => ({
	containerId: `${itemId}-${type}-container`,
	displayId: `${itemId}-${type}-display`,
	valueId: type === "variable" ? `${itemId}-${type}-value` : undefined,
	actionsContainerId: `${itemId}-${type}-actions-container`,
	modifyButtonId: `${itemId}-${type}-set-button`,
	configureButtonId: `${itemId}-${type}-configure-button`,
	showEventsButtonId: `${itemId}-${type}-show-events-button`,
	deleteButtonId: `${itemId}-${type}-delete-button`,
	webhookUrlButtonId: type === "trigger" ? `${itemId}-${type}-webhook-url-button` : undefined,
});

export const getItemId = (itemId: string, type: Entity, key: keyof ItemIds): string => {
	const itemIds = generateItemIds(itemId, type);
	return itemIds[key] ?? "";
};
