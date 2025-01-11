import React from "react";

import { useTranslation } from "react-i18next";

import { SystemSizes } from "@src/types";
import { ButtonType } from "@src/types/components";
import { cn } from "@src/utilities";

import { Button } from "@components/atoms/buttons/button";
import { CopyButton } from "@components/molecules/copyButton";

export const IdCopyButton = ({
	buttonClassName,
	displayFullLength,
	iconClassName,
	id,
	size = "sm",
	variant,
}: {
	buttonClassName?: string;
	displayFullLength?: boolean;
	iconClassName?: string;
	id: string;
	size?: Extract<SystemSizes, "xs" | "sm" | "md">;
	variant?: ButtonType;
}) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });

	const successMessage = t("copied");
	const idPrefix = id.split("_")[0];
	const idSuffix = id.split("_")[1];
	const idSuffixEnd = idSuffix.substring(idSuffix.length - 3, idSuffix.length);
	const idStr = `${idPrefix}...${idSuffixEnd}`;

	return (
		<div className="flex flex-row items-center">
			<Button className={buttonClassName} tabIndex={-1} variant={variant}>
				{displayFullLength ? id : idStr}
			</Button>
			<CopyButton
				className={cn("mb-0.5", iconClassName)}
				size={size}
				successMessage={successMessage}
				tabIndex={0}
				text={id}
			/>
		</div>
	);
};
