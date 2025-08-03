import { BaseEvent } from "@src/types/models";
import { SortConfig } from "@src/types/sortConfig.type";

export interface TableHeaderProps {
	onSort: (key: keyof BaseEvent) => (event: React.MouseEvent | React.KeyboardEvent) => void;
	sortConfig: SortConfig<BaseEvent>;
}

export interface SortableHeaderProps {
	columnKey: keyof BaseEvent;
	columnLabel: string;
	onSort: (key: keyof BaseEvent) => (event: React.MouseEvent | React.KeyboardEvent) => void;
	sortConfig: SortConfig<BaseEvent>;
}
