import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";

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
	resetToDefaults: () => void;
}

export type TablePreferencesStore = TablePreferencesState & TablePreferencesActions;

const fixedColumns = ["name", "actions"];

const defaultColumnConfig: Record<string, ColumnPreference> = {
	name: { id: "name", width: 200, isVisible: true, order: 0 },
	status: { id: "status", width: 120, isVisible: true, order: 1 },
	totalDeployments: { id: "totalDeployments", width: 140, isVisible: true, order: 2 },
	sessions: { id: "sessions", width: 200, isVisible: true, order: 3 },
	lastDeployed: { id: "lastDeployed", width: 180, isVisible: true, order: 4 },
	actions: { id: "actions", width: 120, isVisible: true, order: 5 },
};

const defaultState: TablePreferencesState = {
	projectsTableColumns: defaultColumnConfig,
};

const store: StateCreator<TablePreferencesStore, [["zustand/immer", never]]> = (set) => ({
	...defaultState,

	setColumnWidth: (columnId: string, width: number) => {
		set((state) => {
			if (state.projectsTableColumns[columnId]) {
				state.projectsTableColumns[columnId].width = Math.max(80, width);
			}
		});
	},

	setColumnVisibility: (columnId: string, isVisible: boolean) => {
		set((state) => {
			if (state.projectsTableColumns[columnId] && !fixedColumns.includes(columnId)) {
				state.projectsTableColumns[columnId].isVisible = isVisible;
			}
		});
	},

	setColumnOrder: (columnIds: string[]) => {
		set((state) => {
			columnIds.forEach((id, index) => {
				if (state.projectsTableColumns[id]) {
					state.projectsTableColumns[id].order = index;
				}
			});
		});
	},

	resetToDefaults: () => {
		set(() => defaultState);
	},
});

export const useTablePreferencesStore = create(persist(immer(store), { name: StoreName.tablePreferences }));
