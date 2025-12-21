export interface ColumnPreference {
	id: string;
	width: number;
	isVisible: boolean;
	order: number;
}

export interface TablePreferencesState {
	projectsTableColumns: Record<string, ColumnPreference>;
}

export interface TablePreferencesActions {
	setColumnWidth: (columnId: string, width: number) => void;
	setColumnVisibility: (columnId: string, isVisible: boolean) => void;
	setColumnOrder: (columnIds: string[]) => void;
	recalculateColumnWidths: (containerWidth?: number) => void;
	resetToDefaults: () => void;
}

export type TablePreferencesStore = TablePreferencesState & TablePreferencesActions;
