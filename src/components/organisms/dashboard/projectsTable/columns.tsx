import { ColumnDef, SortingFn } from "@tanstack/react-table";

import { ActionsCell, DeploymentsCell, LastDeployedCell, NameCell, SessionsCell, StatusCell } from "./cells";
import { DeploymentStateVariant } from "@enums";
import { DashboardProjectWithStats } from "@type/models";

export const fixedColumns = ["name", "actions"];

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
		enableResizing: true,
		enableHiding: false,
		size: 200,
		minSize: 120,
		maxSize: 400,
	},
	{
		accessorKey: "status",
		header: "status",
		cell: StatusCell,
		enableSorting: true,
		sortingFn: statusSortingFn,
		enableResizing: true,
		enableHiding: true,
		size: 120,
		minSize: 80,
		maxSize: 200,
	},
	{
		accessorKey: "totalDeployments",
		header: "totalDeployments",
		cell: DeploymentsCell,
		enableSorting: true,
		enableResizing: true,
		enableHiding: true,
		size: 140,
		minSize: 100,
		maxSize: 200,
	},
	{
		id: "sessions",
		header: "sessions",
		cell: SessionsCell,
		enableSorting: false,
		enableResizing: true,
		enableHiding: true,
		size: 200,
		minSize: 120,
		maxSize: 300,
	},
	{
		accessorKey: "lastDeployed",
		header: "lastDeployed",
		cell: LastDeployedCell,
		enableSorting: true,
		enableResizing: true,
		enableHiding: true,
		size: 180,
		minSize: 100,
		maxSize: 280,
	},
	{
		id: "actions",
		header: "actions",
		cell: ActionsCell,
		enableSorting: false,
		enableResizing: true,
		enableHiding: false,
		size: 120,
		minSize: 100,
		maxSize: 180,
	},
];
