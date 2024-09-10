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
	text,
}: {
	className?: string;
	size?: Extract<SystemSizes, "sm" | "md">;
	text: string;
}) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });
	const addToast = useToastStore((state) => state.addToast);

	const copyTextToClipboard = debounce(async (text: string) => {
		const copyResponse = await copyToClipboard(text);
		addToast({
			id: Date.now().toString(),
			message: copyResponse.message,
			type: copyResponse.isError ? "error" : "success",
		});
	}, 300);

	const copyButtonStyle = cn(
		"inline flex h-12 w-12 items-center bg-transparent hover:bg-gray-900",
		{
			"h-12 w-12": size === "md",
			"h-8 w-8": size === "sm",
		},
		className
	);
	const copyButtonIconStyle = cn("h-5 w-5 fill-white", {
		"h-5 w-5": size === "md",
		"h-4 w-4": size === "sm",
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
