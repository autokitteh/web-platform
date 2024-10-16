import React from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";

import { useToastStore } from "@src/store";
import { SystemSizes } from "@src/types";
import { cn, copyToClipboard } from "@src/utilities";

import { IconButton } from "@components/atoms";

import { CopyIcon } from "@assets/image/icons";

export const CopyButton = ({
	className,
	size = "md",
	successMessage,
	text,
}: {
	className?: string;
	size?: Extract<SystemSizes, "xs" | "sm" | "md">;
	successMessage?: string;
	text: string;
}) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });
	const addToast = useToastStore((state) => state.addToast);

	const copyTextToClipboard = debounce(async (text: string) => {
		const { isError, message } = await copyToClipboard(text);

		addToast({
			message: successMessage && !isError ? successMessage : message,
			type: isError ? "error" : "success",
		});
	}, 300);

	const copyButtonStyle = cn(
		"inline flex h-12 w-12 items-center justify-center bg-transparent hover:bg-gray-900",
		{
			"size-12": size === "md",
			"size-8": size === "sm",
			"size-6": size === "xs",
		},
		className
	);
	const copyButtonIconStyle = cn("h-5 w-5 fill-white", {
		"size-5": size === "md",
		"size-4": size === "sm",
		"size-3": size === "xs",
	});

	return (
		<IconButton
			aria-label={t("copyButton")}
			className={copyButtonStyle}
			onClick={() => copyTextToClipboard(text)}
			title={text}
			type="button"
		>
			<CopyIcon className={copyButtonIconStyle} />
		</IconButton>
	);
};
