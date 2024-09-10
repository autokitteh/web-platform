import React from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";

import { useToastStore } from "@src/store";
import { cn, copyToClipboard } from "@src/utilities";

import { IconButton } from "@components/atoms";

import { CopyIcon } from "@assets/image/icons";

export const CopyButton = ({
	className,
	iconClassName,
	text,
}: {
	className?: string;
	iconClassName?: string;
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

	const copyButtonStyle = cn("ml-2 inline bg-transparent p-1", className);
	const copyButtonIconStyle = cn("m-0.5 h-4 w-4 fill-white", iconClassName);

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
