import { StateCreator, create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { StoreName } from "@enums";
import { ColumnPreference, TablePreferencesState, TablePreferencesStore } from "@type/stores";

const fixedColumns = ["name", "actions"];

const defaultColumnRatios: Record<string, { defaultRatio: number; maxWidth: number; minWidth: number }> = {
	name: { defaultRatio: 0.22, minWidth: 120, maxWidth: 400 },
	status: { defaultRatio: 0.12, minWidth: 80, maxWidth: 200 },
	totalDeployments: { defaultRatio: 0.14, minWidth: 100, maxWidth: 200 },
	sessions: { defaultRatio: 0.22, minWidth: 120, maxWidth: 300 },
	lastDeployed: { defaultRatio: 0.18, minWidth: 100, maxWidth: 280 },
	actions: { defaultRatio: 0.12, minWidth: 100, maxWidth: 180 },
};

const calculateResponsiveWidth = (columnId: string, containerWidth: number, ratio?: number): number => {
	const config = defaultColumnRatios[columnId];
	if (!config) return 150;

	const effectiveRatio = ratio ?? config.defaultRatio;
	const calculatedWidth = Math.round(containerWidth * effectiveRatio);

	return Math.max(config.minWidth, Math.min(config.maxWidth, calculatedWidth));
};

const clampWidth = (columnId: string, width: number): number => {
	const config = defaultColumnRatios[columnId];
	if (!config) return Math.max(80, width);

	return Math.max(config.minWidth, Math.min(config.maxWidth, width));
};

const getInitialContainerWidth = (): number => {
	return typeof window !== "undefined" ? window.innerWidth * 0.65 : 1000;
};

const getInitialColumnConfig = (): Record<string, ColumnPreference> => {
	const containerWidth = getInitialContainerWidth();

	return {
		name: {
			id: "name",
			width: calculateResponsiveWidth("name", containerWidth),
			ratio: defaultColumnRatios.name.defaultRatio,
			isVisible: true,
			order: 0,
		},
		status: {
			id: "status",
			width: calculateResponsiveWidth("status", containerWidth),
			ratio: defaultColumnRatios.status.defaultRatio,
			isVisible: true,
			order: 1,
		},
		totalDeployments: {
			id: "totalDeployments",
			width: calculateResponsiveWidth("totalDeployments", containerWidth),
			ratio: defaultColumnRatios.totalDeployments.defaultRatio,
			isVisible: true,
			order: 2,
		},
		sessions: {
			id: "sessions",
			width: calculateResponsiveWidth("sessions", containerWidth),
			ratio: defaultColumnRatios.sessions.defaultRatio,
			isVisible: true,
			order: 3,
		},
		lastDeployed: {
			id: "lastDeployed",
			width: calculateResponsiveWidth("lastDeployed", containerWidth),
			ratio: defaultColumnRatios.lastDeployed.defaultRatio,
			isVisible: true,
			order: 4,
		},
		actions: {
			id: "actions",
			width: calculateResponsiveWidth("actions", containerWidth),
			ratio: defaultColumnRatios.actions.defaultRatio,
			isVisible: true,
			order: 5,
		},
	};
};

const defaultColumnConfig: Record<string, ColumnPreference> = getInitialColumnConfig();

const defaultState: TablePreferencesState = {
	projectsTableColumns: defaultColumnConfig,
	lastContainerWidth: getInitialContainerWidth(),
};

const store: StateCreator<TablePreferencesStore, [["zustand/immer", never]]> = (set) => ({
	...defaultState,

	setColumnWidth: (columnId: string, width: number, containerWidth: number) => {
		set((state) => {
			if (state.projectsTableColumns[columnId]) {
				const clampedWidth = clampWidth(columnId, width);
				state.projectsTableColumns[columnId].width = clampedWidth;
				const currentRatio = state.projectsTableColumns[columnId].ratio;
				state.projectsTableColumns[columnId].ratio =
					containerWidth > 0
						? clampedWidth / containerWidth
						: (currentRatio ?? defaultColumnRatios[columnId]?.defaultRatio ?? 0.15);
				state.lastContainerWidth = containerWidth;
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
			const width = containerWidth || getInitialContainerWidth();
			Object.keys(state.projectsTableColumns).forEach((columnId) => {
				const column = state.projectsTableColumns[columnId];
				const effectiveRatio = column.ratio ?? defaultColumnRatios[columnId]?.defaultRatio;
				state.projectsTableColumns[columnId].width = calculateResponsiveWidth(columnId, width, effectiveRatio);
				if (column.ratio === undefined) {
					state.projectsTableColumns[columnId].ratio = effectiveRatio ?? 0.15;
				}
			});
			state.lastContainerWidth = width;
		});
	},

	updateColumnWidthsOnResize: (newContainerWidth: number) => {
		set((state) => {
			const oldContainerWidth = state.lastContainerWidth || getInitialContainerWidth();
			if (oldContainerWidth === newContainerWidth || newContainerWidth === 0) return;

			Object.keys(state.projectsTableColumns).forEach((columnId) => {
				const column = state.projectsTableColumns[columnId];
				const effectiveRatio = column.ratio ?? defaultColumnRatios[columnId]?.defaultRatio ?? 0.15;
				const newWidth = Math.round(effectiveRatio * newContainerWidth);
				state.projectsTableColumns[columnId].width = clampWidth(columnId, newWidth);
				if (column.ratio === undefined) {
					state.projectsTableColumns[columnId].ratio = effectiveRatio;
				}
			});
			state.lastContainerWidth = newContainerWidth;
		});
	},

	resetToDefaults: () => {
		set(() => ({
			projectsTableColumns: getInitialColumnConfig(),
			lastContainerWidth: getInitialContainerWidth(),
		}));
	},
});

const migrateState = (persistedState: unknown, version: number | undefined): TablePreferencesState => {
	const state = persistedState as Partial<TablePreferencesState>;
	const containerWidth = getInitialContainerWidth();

	if (!state.projectsTableColumns || typeof state.projectsTableColumns !== "object") {
		return { ...defaultState };
	}

	if (version === 0 || !version) {
		Object.keys(state.projectsTableColumns).forEach((columnId) => {
			const column = state.projectsTableColumns![columnId];
			if (column && column.ratio === undefined) {
				const defaultRatio = defaultColumnRatios[columnId]?.defaultRatio;
				column.ratio = defaultRatio ?? (column.width ? column.width / containerWidth : 0.15);
			}
		});
	}

	if (!state.lastContainerWidth) {
		state.lastContainerWidth = containerWidth;
	}

	return state as TablePreferencesState;
};

export const useTablePreferencesStore = create(
	persist(immer(store), {
		name: StoreName.tablePreferences,
		version: 1,
		migrate: migrateState,
	})
);
