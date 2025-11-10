import React from "react";

import { FrontendProjectValidationIndicatorProps } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

import { WarningTriangleIcon } from "@assets/image/icons";

export const FrontendProjectValidationIndicator = ({ level, message }: FrontendProjectValidationIndicatorProps) => {
	return (
		<div aria-label={message} className="flex h-6 w-4 items-center justify-center" role="img" title={message}>
			{level === "error" ? (
				<div className="mb-0.5 size-2 rounded-full bg-error" />
			) : (
				<IconSvg className="mb-1 size-3 fill-yellow-500" src={WarningTriangleIcon} />
			)}
		</div>
	);
};
