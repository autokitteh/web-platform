import React from "react";

import { useTranslation } from "react-i18next";

import { DeleteFileConfirmationProps } from "@src/interfaces/components";

import { Typography } from "@components/atoms";

export const DeleteFileConfirmation = ({
	fileName,
	className = "flex h-full flex-col items-center justify-center p-8 text-center",
}: DeleteFileConfirmationProps) => {
	const { t } = useTranslation("modals", {
		keyPrefix: "deleteFileConfirmation",
	});

	return (
		<div className={className}>
			<Typography className="mb-4 text-red-500" variant="h4">
				{t("title")}
			</Typography>
			<Typography className="mb-6 text-gray-300" variant="body1">
				{t("content", { name: fileName })}
			</Typography>
			<Typography className="text-gray-400" variant="body2">
				{t("warning")}
			</Typography>
		</div>
	);
};
