import { ColumnDef, SortingFn } from "@tanstack/react-table";

import { ActionsCell, DeploymentsCell, LastDeployedCell, NameCell, SessionsCell, StatusCell } from "./cells";
import { DeploymentStateVariant } from "@enums";
import { DashboardProjectWithStats } from "@type/models";

const statusSortingFn: SortingFn<DashboardProjectWithStats> = (rowA, rowB) => {
	const statusOrder: Record<DeploymentStateVariant, number> = {
		[DeploymentStateVariant.active]: 0,
		[DeploymentStateVariant.testing]: 1,
		[DeploymentStateVariant.draining]: 2,
		[DeploymentStateVariant.inactive]: 3,
		[DeploymentStateVariant.unspecified]: 4,
	};

	return statusOrder[rowA.original.status] - statusOrder[rowB.original.status];
};

export const columns: ColumnDef<DashboardProjectWithStats>[] = [
	{
		accessorKey: "name",
		header: "projectName",
		cell: NameCell,
		enableSorting: true,
	},
	{
		accessorKey: "status",
		header: "status",
		cell: StatusCell,
		enableSorting: true,
		sortingFn: statusSortingFn,
	},
	{
		accessorKey: "totalDeployments",
		header: "totalDeployments",
		cell: DeploymentsCell,
		enableSorting: true,
	},
	{
		id: "sessions",
		header: "sessions",
		cell: SessionsCell,
		enableSorting: false,
	},
	{
		accessorKey: "lastDeployed",
		header: "lastDeployed",
		cell: LastDeployedCell,
		enableSorting: true,
	},
	{
		id: "actions",
		header: "actions",
		cell: ActionsCell,
		enableSorting: false,
	},
];

export const getColumnWidthClass = (columnId: string): string => {
	switch (columnId) {
		case "name":
			return "w-2/3 pr-4 sm:w-1/5";
		case "status":
			return "hidden w-1/6 sm:flex";
		case "totalDeployments":
			return "hidden w-1/6 sm:flex";
		case "sessions":
			return "-ml-1 hidden w-2/6 pr-2 sm:flex";
		case "lastDeployed":
			return "hidden w-2/6 sm:flex";
		case "actions":
			return "w-1/3 sm:w-1/6";
		default:
			return "";
	}
};

export const getHeaderWidthClass = (columnId: string): string => {
	switch (columnId) {
		case "name":
			return "w-2/3 sm:w-1/5";
		case "status":
			return "ml-1 hidden w-1/6 sm:flex";
		case "totalDeployments":
			return "hidden w-1/6 sm:flex";
		case "sessions":
			return "hidden w-2/6 sm:flex";
		case "lastDeployed":
			return "hidden w-2/6 sm:flex";
		case "actions":
			return "w-1/3 justify-end pr-4 sm:w-1/6";
		default:
			return "";
	}
};
