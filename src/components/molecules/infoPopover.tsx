import React from "react";

import { Button, IconSvg } from "@components/atoms";
import { PopoverWrapper, PopoverTrigger, PopoverContent } from "@components/molecules/popover";

import { InfoIcon } from "@assets/image/icons";

interface InfoPopoverProps {
	children: React.ReactNode;
	title?: string;
}

export const InfoPopover = ({ children, title }: InfoPopoverProps) => {
	return (
		<PopoverWrapper animation="slideFromBottom" interactionType="hover">
			<PopoverTrigger>
				<Button ariaLabel={title} className="p-0" title={title} variant="ghost">
					<IconSvg size="lg" src={InfoIcon} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="z-40 rounded-lg border-0.5 border-white bg-black p-4">{children}</PopoverContent>
		</PopoverWrapper>
	);
};
