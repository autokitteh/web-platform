import React from "react";

import { ConnectionStatusButtonProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";
import { getConnectionStatusColorByStatus } from "@src/utils";

import { Button } from "@components/atoms";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

export const ConnectionStatusButton = ({
	statusInfoMessage,
	onInitClick,
	className,
	status,
}: ConnectionStatusButtonProps) => {
	if (!statusInfoMessage || status === "ok") {
		return null;
	}

	const connectionColorByStatus = getConnectionStatusColorByStatus(status);

	const buttonClassName = cn(
		"w-[6.8rem] justify-center rounded-md border border-gray-800 bg-transparent px-2 py-0.5 text-xs hover:brightness-90",
		connectionColorByStatus,
		className
	);

	return (
		<PopoverWrapper interactionType="hover" placement="top">
			<PopoverTrigger>
				<div className="flex w-fit items-center gap-0">
					<Button
						ariaLabel={`Fix connection error: ${statusInfoMessage}`}
						className={buttonClassName}
						onClick={(e) => {
							e.stopPropagation();
							onInitClick();
						}}
						title={`Fix connection error: ${statusInfoMessage}`}
					>
						Init
					</Button>
				</div>
			</PopoverTrigger>
			<PopoverContent className="h-6 max-w-md break-all border border-gray-700 bg-gray-900 p-1 text-xs text-white">
				Initialize connection
			</PopoverContent>
		</PopoverWrapper>
	);
};
