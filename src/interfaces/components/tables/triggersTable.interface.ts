import { SortableColumns } from "@types/components";

export interface TableHeader {
	key: SortableColumns | "actions";
	label: string;
	className: string;
	sortable: boolean;
}
