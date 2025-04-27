import React, { memo } from "react";

import { useTranslation } from "react-i18next";

import { useEventsDrawer } from "@contexts";
import { SortableHeaderProps, TableHeaderProps } from "@type/components";
import { cn } from "@utilities";

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
	const { isDrawer } = useEventsDrawer();
	const { t } = useTranslation("events", { keyPrefix: "table.columns" });
	const firstColumnClass = cn("w-1/4 min-w-36 pl-4", { "w-1/2": isDrawer });
	const lastColumnClass = cn("ml-auto w-20");

	return (
		<THead>
			<Tr>
				<Th className={firstColumnClass}>
					<SortableHeader
						columnKey="createdAt"
						columnLabel={t("createdAt")}
						onSort={onSort}
						sortConfig={sortConfig}
					/>
				</Th>
				{isDrawer ? null : (
					<>
						<Th className="w-1/4 min-w-32">
							<SortableHeader
								columnKey="eventId"
								columnLabel={t("eventId")}
								onSort={onSort}
								sortConfig={sortConfig}
							/>
						</Th>
						<Th className="w-1/4 min-w-32">
							<SortableHeader
								columnKey="destinationId"
								columnLabel={t("sourceId")}
								onSort={onSort}
								sortConfig={sortConfig}
							/>
						</Th>
					</>
				)}
				<Th className="w-1/4 min-w-32">
					<SortableHeader
						columnKey="eventType"
						columnLabel={t("type")}
						onSort={onSort}
						sortConfig={sortConfig}
					/>
				</Th>
				{isDrawer ? null : <Th className={lastColumnClass}>{t("actions")}</Th>}
			</Tr>
		</THead>
	);
});

TableHeader.displayName = "TableHeader";
