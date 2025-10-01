import React from "react";

import { IconSvg } from "@components/atoms";
import { PopoverWrapper, PopoverTrigger, PopoverContent } from "@components/molecules/popover";

import { InfoIcon } from "@assets/image/icons";

interface InfoPopoverProps {
	children: React.ReactNode;
}

export const InfoPopover = ({ children }: InfoPopoverProps) => {
	return (
		<PopoverWrapper animation="slideFromBottom" interactionType="hover">
			<PopoverTrigger>
				<IconSvg className="size-4" src={InfoIcon} />
			</PopoverTrigger>
			<PopoverContent className="z-40 rounded-lg border-0.5 border-white bg-black p-4">{children}</PopoverContent>
		</PopoverWrapper>
	);
};
