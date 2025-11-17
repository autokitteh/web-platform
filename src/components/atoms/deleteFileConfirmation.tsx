import React from "react";

import { Typography } from "@components/atoms";

interface DeleteFileConfirmationProps {
	fileName: string;
	className?: string;
}

export const DeleteFileConfirmation: React.FC<DeleteFileConfirmationProps> = ({
	fileName,
	className = "flex h-full flex-col items-center justify-center p-8 text-center",
}) => {
	return (
		<div className={className}>
			<Typography className="mb-4 text-red-500" variant="h4">
				Delete Confirmation
			</Typography>
			<Typography className="mb-6 text-gray-300" variant="body1">
				Are you sure you want to delete the file &quot;{fileName}&quot;?
			</Typography>
			<Typography className="text-gray-400" variant="body2">
				This action cannot be undone.
			</Typography>
		</div>
	);
};
