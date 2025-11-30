import React from "react";

import { Button } from "@components/atoms";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

interface ConnectionStatusButtonProps {
	errorMessage?: string;
	onInitClick: () => void;
}

export const ConnectionStatusButton = ({ errorMessage, onInitClick }: ConnectionStatusButtonProps) => {
	if (!errorMessage) {
		return null;
	}

	return (
		<PopoverWrapper interactionType="hover" placement="top">
			<PopoverTrigger>
				<div className="flex w-fit items-center gap-0">
					<Button
						ariaLabel={`Fix connection error: ${errorMessage}`}
						className="w-[6.8rem] justify-center rounded-md border border-gray-800 bg-transparent px-2 py-0.5 text-xs text-error hover:brightness-90"
						onClick={(e) => {
							e.stopPropagation();
							onInitClick();
						}}
						title={`Fix connection error: ${errorMessage}`}
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
