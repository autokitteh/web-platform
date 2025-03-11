import React from "react";

import { cn } from "@src/utilities";

import { IconSvg } from "@components/atoms";

export const IntegrationsMenuPopoverItem = ({
	name,
	isCurrentIntegration,
	icon,
}: {
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	isCurrentIntegration: boolean;
	name: string;
}) => {
	const baseClass = cn(
		"group flex items-center gap-2 whitespace-nowrap rounded-lg p-2 text-black transition",
		"pointer-events-none mt-0.5 select-none overflow-hidden hover:bg-gray-1050 hover:text-white",
		{
			"bg-gray-1050 text-white": isCurrentIntegration,
		}
	);

	return (
		<div className={baseClass}>
			{icon ? (
				<div className="rounded-full bg-gray-400 p-1">
					<IconSvg size="lg" src={icon} />
				</div>
			) : null}
			{name}
		</div>
	);
};
