import React, { useMemo } from "react";

import { RowData } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

import { TableActionsProps } from "@interfaces/components";

import { Button } from "@components/atoms";

export const TableActionsTanstack = <TData extends RowData>({
	selectedRows,
	actions,
	onReset,
}: TableActionsProps<TData>) => {
	const { t } = useTranslation("table", { keyPrefix: "tableActions" });

	const isShowActions = useMemo(() => {
		return selectedRows.length > 0;
	}, [selectedRows]);

	return (
		<div className="flex items-center gap-4">
			<div className="flex gap-2">
				<Button className="rounded-md bg-black text-white" disabled={!isShowActions} onClick={onReset}>
					{t("resetAll")}
				</Button>
				{isShowActions
					? actions?.map((action, index) => (
							<Button
								className="rounded-md bg-gray-1000 text-white hover:bg-gray-1000/60"
								key={index}
								onClick={() => action.onClick(selectedRows)}
							>
								{action.label} ({selectedRows.length})
							</Button>
						))
					: null}
			</div>
		</div>
	);
};
