import React from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";

import { useToastStore } from "@src/store";
import { SystemSizes } from "@src/types";
import { cn, copyToClipboard } from "@src/utilities";

import { Button } from "@components/atoms";

import { CopyIcon } from "@assets/image/icons";

export const CopyButton = ({
	className,
	size = "xs",
	successMessage,
	tabIndex = 0,
	text,
	title,
	disabled,
}: {
	className?: string;
	disabled?: boolean;
	size?: Extract<SystemSizes, "xs" | "sm" | "md">;
	successMessage?: string;
	tabIndex?: number;
	text: string;
	title?: string;
}) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });
	const addToast = useToastStore((state) => state.addToast);

	const handleCopy = debounce(async (textToCopy: string) => {
		const { isError, message } = await copyToClipboard(textToCopy);

		addToast({
			message: successMessage && !isError ? successMessage : message,
			type: isError ? "error" : "success",
		});
	}, 300);

	const copyTextToClipboard = (event: React.MouseEvent | React.KeyboardEvent) => {
		event.preventDefault();
		event.stopPropagation();

		handleCopy(text);
	};

	const copyButtonStyle = cn(
		"flex size-12 items-center justify-center bg-transparent hover:bg-gray-900",
		{
			"size-12": size === "md",
			"size-8": size === "sm",
			"size-6": size === "xs",
		},
		className
	);
	const copyButtonIconStyle = cn("fill-white", {
		"size-5": size === "md",
		"size-4": size === "sm",
		"size-3": size === "xs",
	});

	return (
		<Button
			ariaLabel={t("copyButtonText", { text: title })}
			className={copyButtonStyle}
			disabled={disabled}
			onClick={copyTextToClipboard}
			onKeyPressed={copyTextToClipboard}
			tabIndex={tabIndex}
			title={t("copyButtonText", { text: title })}
			type="button"
		>
			<CopyIcon className={copyButtonIconStyle} />
		</Button>
	);
};
