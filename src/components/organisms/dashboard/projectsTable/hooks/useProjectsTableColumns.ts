import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import { DragEndEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { ColumnOrderState, ColumnSizingState, SortingState, VisibilityState } from "@tanstack/react-table";

import { fixedColumns } from "../columns";

import { useTablePreferencesStore } from "@store";

export interface UseProjectsTableColumnsReturn {
	sorting: SortingState;
	setSorting: Dispatch<SetStateAction<SortingState>>;
	columnOrder: ColumnOrderState;
	setColumnOrder: Dispatch<SetStateAction<ColumnOrderState>>;
	columnSizing: ColumnSizingState;
	columnVisibility: VisibilityState;
	handleDragEnd: (event: DragEndEvent) => void;
	handleColumnSizingChange: (updater: ColumnSizingState | ((old: ColumnSizingState) => ColumnSizingState)) => void;
	handleVisibilityChange: (updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => void;
	sensors: ReturnType<typeof useSensors>;
}

export const useProjectsTableColumns = (): UseProjectsTableColumnsReturn => {
	const {
		projectsTableColumns,
		setColumnWidth,
		setColumnOrder: persistColumnOrder,
		setColumnVisibility: persistColumnVisibility,
		recalculateColumnWidths,
	} = useTablePreferencesStore();

	const [sorting, setSorting] = useState<SortingState>([{ id: "name", desc: false }]);

	const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
		Object.entries(projectsTableColumns)
			.sort(([, a], [, b]) => a.order - b.order)
			.map(([id]) => id)
	);

	const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() =>
		Object.entries(projectsTableColumns).reduce((acc, [id, config]) => {
			acc[id] = config.width;

			return acc;
		}, {} as ColumnSizingState)
	);

	useEffect(() => {
		recalculateColumnWidths();
		setColumnSizing(
			Object.entries(useTablePreferencesStore.getState().projectsTableColumns).reduce((acc, [id, config]) => {
				acc[id] = config.width;

				return acc;
			}, {} as ColumnSizingState)
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() =>
		Object.entries(projectsTableColumns).reduce((acc, [id, config]) => {
			acc[id] = config.isVisible;

			return acc;
		}, {} as VisibilityState)
	);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 8,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 200,
				tolerance: 5,
			},
		}),
		useSensor(KeyboardSensor)
	);

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			const { active, over } = event;
			if (over && active.id !== over.id) {
				const oldIndex = columnOrder.indexOf(active.id as string);
				const newIndex = columnOrder.indexOf(over.id as string);
				const newOrder = arrayMove(columnOrder, oldIndex, newIndex);
				setColumnOrder(newOrder);
				persistColumnOrder(newOrder);
			}
		},
		[columnOrder, persistColumnOrder]
	);

	const handleColumnSizingChange = useCallback(
		(updater: ColumnSizingState | ((old: ColumnSizingState) => ColumnSizingState)) => {
			setColumnSizing((old) => {
				const newSizing = typeof updater === "function" ? updater(old) : updater;
				Object.entries(newSizing).forEach(([columnId, width]) => {
					if (typeof width === "number") {
						setColumnWidth(columnId, width);
					}
				});

				return newSizing;
			});
		},
		[setColumnWidth]
	);

	const handleVisibilityChange = useCallback(
		(updater: VisibilityState | ((old: VisibilityState) => VisibilityState)) => {
			setColumnVisibility((old) => {
				const newVisibility = typeof updater === "function" ? updater(old) : updater;
				Object.entries(newVisibility).forEach(([columnId, isVisible]) => {
					if (typeof isVisible === "boolean" && !fixedColumns.includes(columnId)) {
						persistColumnVisibility(columnId, isVisible);
					}
				});

				return newVisibility;
			});
		},
		[persistColumnVisibility]
	);

	return {
		sorting,
		setSorting,
		columnOrder,
		setColumnOrder,
		columnSizing,
		columnVisibility,
		handleDragEnd,
		handleColumnSizingChange,
		handleVisibilityChange,
		sensors,
	};
};
