import React from "react";

import { Table } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { fixedColumns } from "./columns";
import { DashboardProjectWithStats } from "@type/models";

import { useTablePreferencesStore } from "@store";

import { Checkbox, IconButton } from "@components/atoms";
import { PopoverWrapper, PopoverTrigger, PopoverContent } from "@components/molecules/popover";

import { SettingsIcon } from "@assets/image/icons";

interface ColumnVisibilityMenuProps {
	table: Table<DashboardProjectWithStats>;
}

export const ColumnVisibilityMenu = ({ table }: ColumnVisibilityMenuProps) => {
	const { t } = useTranslation("dashboard", { keyPrefix: "projects" });
	const { setColumnVisibility, projectsTableColumns } = useTablePreferencesStore();

	const allColumns = table.getAllColumns().filter((column) => !fixedColumns.includes(column.id));

	const handleToggleColumn = (columnId: string, isVisible: boolean) => {
		setColumnVisibility(columnId, isVisible);
		table.getColumn(columnId)?.toggleVisibility(isVisible);
	};

	return (
		<PopoverWrapper interactionType="click" placement="bottom-end">
			<PopoverTrigger ariaLabel={t("buttons.columnSettings")}>
				<IconButton className="group hover:bg-gray-850" title={t("buttons.columnSettings")}>
					<SettingsIcon className="size-4 fill-white group-hover:fill-green-800" />
				</IconButton>
			</PopoverTrigger>
			<PopoverContent className="min-w-48 p-3">
				<div className="mb-2 text-sm font-medium text-gray-300">{t("table.columnVisibility")}</div>
				<div className="flex flex-col gap-1">
					{allColumns.map((column) => {
						const columnConfig = projectsTableColumns[column.id];
						const isVisible = columnConfig?.isVisible ?? true;

						return (
							<Checkbox
								checked={isVisible}
								className="self-start py-1"
								isLoading={false}
								key={column.id}
								label={t(`table.columns.${column.columnDef.header}`)}
								onChange={(checked) => handleToggleColumn(column.id, checked)}
							/>
						);
					})}
				</div>
			</PopoverContent>
		</PopoverWrapper>
	);
};
