import React from "react";

import { ConnectionItem } from "@interfaces/components";

import { Button, IconSvg } from "@components/atoms";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

interface ConnectionItemDisplayProps {
	item: ConnectionItem;
	onConfigure: (id: string) => void;
}

export const ConnectionItemDisplay = ({ item, onConfigure }: ConnectionItemDisplayProps) => {
	const connectionStateErrored = !!item.errorMessage;

	return (
		<span className="flex items-center gap-2">
			{item?.icon ? <IconSvg className="rounded-full bg-white p-1" size="md" src={item.icon} /> : null}
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] max-w-[60px] truncate sm:min-w-[70px] sm:max-w-[70px] md:min-w-[80px] md:max-w-[80px] lg:min-w-[85px] lg:max-w-[85px] xl:min-w-[90px] xl:max-w-[90px]">
					{item.name}
				</span>
				{connectionStateErrored ? (
					<PopoverWrapper interactionType="hover" placement="top">
						<PopoverTrigger asChild>
							<div className="flex w-full items-center gap-0">
								<Button
									ariaLabel={`Fix connection error: ${item.errorMessage}`}
									className="w-[6.8rem] justify-center rounded-md border border-gray-800 bg-transparent px-2 py-0.5 text-xs text-error hover:brightness-90"
									onClick={() => onConfigure(item.id)}
									title={`Fix connection error: ${item.errorMessage}`}
								>
									{item.errorMessage}
								</Button>
							</div>
						</PopoverTrigger>
						<PopoverContent className="h-6 max-w-md break-all border border-gray-700 bg-gray-900 p-1 text-xs text-white">
							<span className="font-semibold">Start connection configuration</span>
						</PopoverContent>
					</PopoverWrapper>
				) : null}
			</span>
		</span>
	);
};
