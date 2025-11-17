import React from "react";

import { CodeFixMessageProps } from "@src/interfaces/components";

import { Typography } from "@components/atoms";

export const CodeFixMessage = ({
	warningMessage,
	errorMessage,
	className = "mb-3 rounded-md border border-none bg-gray-1100 p-3",
}: CodeFixMessageProps) => {
	if (!warningMessage && !errorMessage) {
		return null;
	}

	return (
		<div className={className}>
			{warningMessage ? (
				<Typography className="text-orange-500" variant="body2">
					{warningMessage}
				</Typography>
			) : null}
			{errorMessage ? (
				<Typography className="text-error" variant="body2">
					{errorMessage}
				</Typography>
			) : null}
		</div>
	);
};
