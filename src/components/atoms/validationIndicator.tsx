import React from "react";

import { IconSvg } from "@components/atoms";

import { WarningTriangleIcon } from "@assets/image/icons";

interface ValidationIndicatorProps {
	validation: {
		level?: string;
		message?: string;
	};
}

export const ValidationIndicator = ({ validation }: ValidationIndicatorProps) => {
	return (
		<div className="flex h-6 w-4 items-center justify-center">
			{validation.level && validation.message ? (
				validation.level === "error" ? (
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
