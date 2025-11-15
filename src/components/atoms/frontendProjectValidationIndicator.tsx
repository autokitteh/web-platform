import React from "react";

import { FrontendProjectValidationIndicatorProps } from "@interfaces/components";

import { IconSvg } from "@components/atoms";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { WarningTriangleIcon } from "@assets/image/icons";

export const FrontendProjectValidationIndicator = ({ level, message }: FrontendProjectValidationIndicatorProps) => {
	return (
		<PopoverWrapper interactionType="hover" placement="top">
			<PopoverTrigger asChild>
				<div aria-label={message} className="flex h-6 w-4 items-center justify-center" role="img">
					{level === "error" ? (
						<div className="mb-0.5 size-2 rounded-full bg-error" />
					) : (
						<IconSvg className="mb-1 size-3 fill-yellow-500" src={WarningTriangleIcon} />
					)}
				</div>
			</PopoverTrigger>
			<PopoverContent className="max-w-xs border border-gray-700 bg-gray-900 p-2 text-xs text-white">
				{message}
			</PopoverContent>
		</PopoverWrapper>
	);
};
