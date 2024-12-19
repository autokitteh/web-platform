import React, { memo } from "react";

import { useTranslation } from "react-i18next";

import { SortableHeaderProps, TableHeaderProps } from "@src/types/components";

import { THead, Th, Tr } from "@components/atoms";
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
	const { t } = useTranslation("events", { keyPrefix: "table.columns" });

	return (
		<THead>
			<Tr>
				<Th className="mr-2 w-36 pl-4">
					<SortableHeader
						columnKey="createdAt"
						columnLabel={t("createdAt")}
						onSort={onSort}
						sortConfig={sortConfig}
					/>
				</Th>
				<Th className="mr-2 w-24">
					<SortableHeader
						columnKey="eventId"
						columnLabel={t("eventId")}
						onSort={onSort}
						sortConfig={sortConfig}
					/>
				</Th>
				<Th className="mr-2 w-24">
					<SortableHeader
						columnKey="destinationId"
						columnLabel={t("sourceId")}
						onSort={onSort}
						sortConfig={sortConfig}
					/>
				</Th>
				<Th className="mr-2 w-1/4">
					<SortableHeader
						columnKey="eventType"
						columnLabel={t("type")}
						onSort={onSort}
						sortConfig={sortConfig}
					/>
				</Th>
			</Tr>
		</THead>
	);
});

TableHeader.displayName = "TableHeader";
