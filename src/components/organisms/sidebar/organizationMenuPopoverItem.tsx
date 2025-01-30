import React from "react";

import { MemberStatusType } from "@src/enums";
import { cn } from "@src/utilities";

export const OrganizationMenuPopoverItem = ({
	status,
	name,
	isCurrentOrganization,
}: {
	isCurrentOrganization: boolean;
	name: string;
	status?: MemberStatusType;
}) => {
	const baseClass = cn(
		"flex cursor-pointer items-center rounded-lg transition whitespace-nowrap p-2 text-black hover:bg-gray-1050 hover:text-white mt-0.5",
		{
			"bg-green-200": status === MemberStatusType.invited,
			"select-none text-white rounded-lg bg-gray-1100": isCurrentOrganization,
		}
	);

	return <div className={baseClass}>{name}</div>;
};
