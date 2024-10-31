import React, { memo } from "react";

import { useTranslation } from "react-i18next";

import { SortableHeaderProps, TableHeaderProps } from "@src/types/components";

import { THead, Td, Th } from "@components/atoms";
import { SortButton } from "@components/molecules";

export const SortableHeader = memo(({ columnKey, columnLabel, onSort, sortConfig }: SortableHeaderProps) => (
	<div
		className="group flex cursor-pointer items-center font-normal outline-none focus:ring-2 focus:ring-blue-500"
		onClick={onSort(columnKey)}
		onKeyDown={onSort(columnKey)}
		role="button"
		tabIndex={0}
	>
		<div className="mt-0.5">{columnLabel}</div>
		<SortButton
			className="opacity-0 group-hover:opacity-100 group-focus:opacity-100"
			isActive={columnKey === sortConfig?.key}
			sortDirection={sortConfig.direction}
		/>
	</div>
));

SortableHeader.displayName = "SortableHeader";

export const TableHeader = memo(({ onSort, sortConfig }: TableHeaderProps) => {
	const { t } = useTranslation("events");

	return (
		<THead className="pl-3">
			<Th>
				<Td>
					<SortableHeader
						columnKey="createdAt"
						columnLabel={t("table.columns.createdAt")}
						onSort={onSort}
						sortConfig={sortConfig}
					/>
				</Td>
				<Td className="-ml-2">
					<SortableHeader
						columnKey="eventId"
						columnLabel={t("table.columns.eventId")}
						onSort={onSort}
						sortConfig={sortConfig}
					/>
				</Td>
			</Th>
		</THead>
	);
});

TableHeader.displayName = "TableHeader";
