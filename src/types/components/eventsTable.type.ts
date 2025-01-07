import { BaseEvent } from "../models";
import { SortConfig } from "../sortConfig.type";

export interface TableHeaderProps {
	onSort: (key: keyof BaseEvent) => (event: React.MouseEvent | React.KeyboardEvent) => void;
	sortConfig: SortConfig<BaseEvent>;
	isDrawer?: boolean;
}

export interface SortableHeaderProps {
	columnKey: keyof BaseEvent;
	columnLabel: string;
	onSort: (key: keyof BaseEvent) => (event: React.MouseEvent | React.KeyboardEvent) => void;
	sortConfig: SortConfig<BaseEvent>;
}
