import React, { useRef } from "react";

import { TriggerInfoPopover } from "./triggerInfoPopover";
import { getApiBaseUrl } from "@src/utilities";

import { Button } from "@components/atoms";
import { CopyButton, CopyButtonRef } from "@components/molecules";
import { InfoPopover } from "@components/molecules/infoPopover";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

interface TriggerItemDisplayProps {
	id: string;
	name: string;
	webhookSlug: string;
}

export const TriggerItemDisplay = ({ id, name, webhookSlug }: TriggerItemDisplayProps) => {
	const apiBaseUrl = getApiBaseUrl();
	const webhookUrl = webhookSlug ? `${apiBaseUrl}/webhooks/${webhookSlug}` : undefined;
	const shortenedUrl = webhookUrl ? `...${webhookUrl.slice(-10)}` : undefined;

	const copyButtonRef = useRef<CopyButtonRef>(null);

	const handleCopyClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		copyButtonRef.current?.copy();
	};

	return (
		<span className="flex items-center gap-2">
			<InfoPopover title={`Trigger information for "${name}"`}>
				<TriggerInfoPopover triggerId={id!} />
			</InfoPopover>
			<span className="flex items-center gap-2">
				<span className="min-w-[60px] max-w-[60px] truncate sm:min-w-[70px] sm:max-w-[70px] md:min-w-[80px] md:max-w-[80px] lg:min-w-[85px] lg:max-w-[85px] xl:min-w-[90px] xl:max-w-[90px]">
					{name}
				</span>
				{webhookUrl ? (
					<PopoverWrapper interactionType="hover" placement="top">
						<PopoverTrigger asChild>
							<div className="flex w-full items-center gap-0">
								<Button
									ariaLabel={`${name} webhook URL`}
									className="group w-[6.8rem] justify-center gap-0 rounded-md border border-gray-800 bg-transparent p-0 pl-2 text-xs text-white hover:brightness-90"
									onClick={handleCopyClick}
									title={webhookUrl}
								>
									{shortenedUrl}
									<CopyButton
										ariaLabel={`${name} webhook URL`}
										className="shrink-0 hover:bg-transparent group-hover:bg-transparent group-hover:stroke-green-800"
										dataTestId={`copy-${name}-webhook-url`}
										ref={copyButtonRef}
										size="xs"
										text={webhookUrl}
										title={`${name} webhook URL`}
									/>
								</Button>
							</div>
						</PopoverTrigger>
						<PopoverContent className="max-w-md break-all border border-gray-700 bg-gray-900 p-1 text-xs text-white">
							<div className="flex flex-col gap-1">
								<span className="font-semibold">Click to copy the trigger URL:</span>
								<code className="text-xs text-gray-300">{webhookUrl}</code>
							</div>
						</PopoverContent>
					</PopoverWrapper>
				) : null}
			</span>
		</span>
	);
};
