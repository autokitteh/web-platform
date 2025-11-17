import React from "react";

import { Typography } from "@components/atoms";

interface CodeFixMessageProps {
	warningMessage?: string;
	errorMessage?: string;
	className?: string;
}

export const CodeFixMessage: React.FC<CodeFixMessageProps> = ({
	warningMessage,
	errorMessage,
	className = "mb-3 rounded-md border border-none bg-gray-1100 p-3",
}) => {
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
