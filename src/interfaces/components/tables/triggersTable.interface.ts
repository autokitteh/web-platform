import { SortableColumns } from "@type/components";

export interface TableHeader {
	key: SortableColumns | "actions";
	label: string;
	className: string;
	sortable: boolean;
}
