export interface ColumnPreference {
	id: string;
	width: number;
	ratio: number;
	isVisible: boolean;
	order: number;
}

export interface TablePreferencesState {
	projectsTableColumns: Record<string, ColumnPreference>;
	lastContainerWidth: number;
}

export interface TablePreferencesActions {
	setColumnWidth: (columnId: string, width: number, containerWidth: number) => void;
	setColumnVisibility: (columnId: string, isVisible: boolean) => void;
	setColumnOrder: (columnIds: string[]) => void;
	recalculateColumnWidths: (containerWidth?: number) => void;
	updateColumnWidthsOnResize: (newContainerWidth: number) => void;
	resetToDefaults: () => void;
}

export type TablePreferencesStore = TablePreferencesState & TablePreferencesActions;
