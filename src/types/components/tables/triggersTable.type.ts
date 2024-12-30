import { Trigger } from "@src/types/models";

export type SortableColumns = keyof Pick<Trigger, "name" | "sourceType" | "entrypoint">;

export type TriggerPopoverInformation = {
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	value?: string | React.ReactNode;
};
