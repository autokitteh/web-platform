import React from "react";

import { useTranslation } from "react-i18next";

import { ButtonType } from "@src/types/components";
import { cn } from "@src/utilities";

import { Button } from "@components/atoms/buttons/button";
import { CopyButton } from "@components/molecules/copyButton";

export const IdCopyButton = ({
	buttonClassName,
	displayFullLength,
	id,
	variant,
	hideId,
	wrapperClassName,
}: {
	buttonClassName?: string;
	displayFullLength?: boolean;
	hideId?: boolean;
	id: string;
	variant?: ButtonType;
	wrapperClassName?: string;
}) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });

	const successMessage = t("copied");
	const idPrefix = id.split("_")[0];
	const idSuffix = id.split("_")[1];
	const idSuffixEnd = idSuffix.substring(idSuffix.length - 3, idSuffix.length);
	const idStr = `${idPrefix}...${idSuffixEnd}`;

	const wrapperClass = cn("flex flex-row items-center", wrapperClassName);

	return (
		<div className={wrapperClass}>
			{hideId ? null : (
				<Button className={buttonClassName} tabIndex={-1} variant={variant}>
					{displayFullLength ? id : idStr}
				</Button>
			)}
			<CopyButton className="mb-0.5 p-0" successMessage={successMessage} tabIndex={0} text={id} title={id} />
		</div>
	);
};
