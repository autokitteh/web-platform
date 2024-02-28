import { ESortDirection } from "@enums/components";
import { TSortDirection } from "@type/components";

export const getSortDirection = (currentDirection: TSortDirection): ESortDirection => {
	return currentDirection === ESortDirection.Ascending ? ESortDirection.Descending : ESortDirection.Ascending;
};
