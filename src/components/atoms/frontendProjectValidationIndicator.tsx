import React from "react";

import { FrontendProjectValidationProps } from "@interfaces/components";

import { IconSvg } from "@components/atoms";

import { WarningTriangleIcon } from "@assets/image/icons";

export const FrontendProjectValidationIndicator = ({ level, message }: FrontendProjectValidationProps) => {
	return (
		<div className="flex h-6 w-4 items-center justify-center">
			{level && message ? (
				level === "error" ? (
					<div className="mb-0.5 size-2 rounded-full bg-error" />
				) : (
					<IconSvg className="mb-1 size-3 fill-yellow-500" src={WarningTriangleIcon} />
				)
			) : (
				<div className="mb-0.5 size-2 rounded-full bg-green-500" />
			)}
		</div>
	);
};
