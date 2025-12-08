import { HiOutlineOfficeBuilding } from "react-icons/hi";

import { TitleTopbar } from "@components/organisms/topbar/topbar";

export const GlobalConnectionsTableTitle = ({ title }: { title: string }) => {
	return (
		<div className="flex w-full items-center gap-1 bg-gray-1250">
			<HiOutlineOfficeBuilding className="mb-0.5 ml-6 size-5 stroke-gray-500" />
			<TitleTopbar className="pl-3" title={title} />
		</div>
	);
};
