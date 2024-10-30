import React from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";

import { useToastStore } from "@src/store";
import { cn, copyToClipboard } from "@src/utilities";

import { IconButton } from "@components/atoms";

import { CopyIcon } from "@assets/image/icons";

export const IdCopyButton = ({ id }: { id: string }) => {
	const { t } = useTranslation("components", { keyPrefix: "buttons" });
	const addToast = useToastStore((state) => state.addToast);

	const successMessage = t("copied");

	const copyTextToClipboard = debounce(async (text: string) => {
		const { isError, message } = await copyToClipboard(text);

		addToast({
			message: successMessage && !isError ? successMessage : message,
			type: isError ? "error" : "success",
		});
	}, 300);

	const copyButtonStyle = cn(
		"inline flex h-12 w-12 items-center justify-center bg-transparent hover:bg-gray-900 size-8"
	);
	const copyButtonIconStyle = cn("h-5 w-5 fill-white size-4");

	return (
		<div className="flex flex-row items-center">
			<span> {id.substring(0, 8)}...</span>
			<IconButton
				aria-label={t("copyButton")}
				className={copyButtonStyle}
				onClick={() => copyTextToClipboard(id)}
				title={id}
				type="button"
			>
				<CopyIcon className={copyButtonIconStyle} />
			</IconButton>
		</div>
	);
};
