import React from "react";

import { useTranslation } from "react-i18next";

import { ButtonType } from "@src/types/components";

import { Button } from "@components/atoms/buttons/button";
import { CopyButton } from "@components/molecules/copyButton";

export const IdCopyButton = ({
	buttonClassName,
	id,
	onIdClick,
	variant,
}: {
	buttonClassName?: string;
	id: string;
	onIdClick?: (id?: string) => void;
	variant?: ButtonType;
}) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });

	const successMessage = t("copied");

	return (
		<div className="flex flex-row items-center">
			<Button className={buttonClassName} onClick={() => onIdClick?.(id)} variant={variant}>
				{" "}
				{id.substring(0, 8)}...
			</Button>
			<CopyButton className="mb-0.5" size="sm" successMessage={successMessage} text={id} />
		</div>
	);
};
