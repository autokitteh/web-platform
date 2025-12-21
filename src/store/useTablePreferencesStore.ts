import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { ColumnPreference, TablePreferencesState, TablePreferencesStore } from "@type/stores";

const fixedColumns = ["name", "actions"];

const columnWidthRatios: Record<string, { maxWidth: number; minWidth: number; ratio: number }> = {
	name: { ratio: 0.22, minWidth: 120, maxWidth: 400 },
	status: { ratio: 0.12, minWidth: 80, maxWidth: 200 },
	totalDeployments: { ratio: 0.14, minWidth: 100, maxWidth: 200 },
	sessions: { ratio: 0.22, minWidth: 120, maxWidth: 300 },
	lastDeployed: { ratio: 0.18, minWidth: 100, maxWidth: 280 },
	actions: { ratio: 0.12, minWidth: 100, maxWidth: 180 },
};

const calculateResponsiveWidth = (columnId: string, containerWidth: number): number => {
	const config = columnWidthRatios[columnId];
	if (!config) return 150;

	const calculatedWidth = Math.round(containerWidth * config.ratio);

	return Math.max(config.minWidth, Math.min(config.maxWidth, calculatedWidth));
};

const getInitialColumnConfig = (): Record<string, ColumnPreference> => {
	const containerWidth = typeof window !== "undefined" ? window.innerWidth * 0.65 : 1000;

	return {
		name: { id: "name", width: calculateResponsiveWidth("name", containerWidth), isVisible: true, order: 0 },
		status: { id: "status", width: calculateResponsiveWidth("status", containerWidth), isVisible: true, order: 1 },
		totalDeployments: {
			id: "totalDeployments",
			width: calculateResponsiveWidth("totalDeployments", containerWidth),
			isVisible: true,
			order: 2,
		},
		sessions: {
			id: "sessions",
			width: calculateResponsiveWidth("sessions", containerWidth),
			isVisible: true,
			order: 3,
		},
		lastDeployed: {
			id: "lastDeployed",
			width: calculateResponsiveWidth("lastDeployed", containerWidth),
			isVisible: true,
			order: 4,
		},
		actions: {
			id: "actions",
			width: calculateResponsiveWidth("actions", containerWidth),
			isVisible: true,
			order: 5,
		},
	};
};

const defaultColumnConfig: Record<string, ColumnPreference> = getInitialColumnConfig();

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

	recalculateColumnWidths: (containerWidth?: number) => {
		set((state) => {
			const width = containerWidth || (typeof window !== "undefined" ? window.innerWidth * 0.65 : 1000);
			Object.keys(state.projectsTableColumns).forEach((columnId) => {
				state.projectsTableColumns[columnId].width = calculateResponsiveWidth(columnId, width);
			});
		});
	},

	resetToDefaults: () => {
		set(() => ({ projectsTableColumns: getInitialColumnConfig() }));
	},
});

export const useTablePreferencesStore = create(persist(immer(store), { name: StoreName.tablePreferences }));
