import React from "react";

import { useTranslation } from "react-i18next";

import { CopyButton } from "./copyButton";

export const IdCopyButton = ({ id }: { id: string }) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });

	const successMessage = t("copied");

	return (
		<div className="flex flex-row items-center">
			<span> {id.substring(0, 8)}...</span>
			<CopyButton className="mb-0.5" size="sm" successMessage={successMessage} text={id} />
		</div>
	);
};
