import React, { forwardRef, useImperativeHandle, useRef } from "react";

import { debounce } from "lodash";
import { useTranslation } from "react-i18next";

import { useToastStore } from "@src/store";
import { SystemSizes } from "@src/types";
import { cn, copyToClipboard } from "@src/utilities";

import { Button } from "@components/atoms";

import { CopyIcon } from "@assets/image/icons";

export interface CopyButtonRef {
	copy: () => void;
}

export const CopyButton = forwardRef<
	CopyButtonRef,
	{
		ariaLabel?: string;
		buttonText?: string;
		className?: string;
		dataTestId?: string;
		iconClassName?: string;
		size?: Extract<SystemSizes, "xs" | "sm" | "md">;
		successMessage?: string;
		tabIndex?: number;
		text: string;
		title?: string;
	}
>(
	(
		{
			ariaLabel,
			className,
			dataTestId,
			iconClassName,
			size = "xs",
			successMessage,
			tabIndex = 0,
			text,
			title,
			buttonText,
		},
		ref
	) => {
		const { t } = useTranslation("components", { keyPrefix: "buttons" });
		const addToast = useToastStore((state) => state.addToast);

		const copyTextToClipboardRef = useRef(
			debounce(async (text: string) => {
				const { isError, message } = await copyToClipboard(text);

				addToast({
					message: successMessage && !isError ? successMessage : message,
					type: isError ? "error" : "success",
				});
			}, 300)
		);

		const copyTextToClipboard = copyTextToClipboardRef.current;

		useImperativeHandle(ref, () => ({
			copy: () => copyTextToClipboard(text),
		}));

		const copyButtonStyle = cn(
			"m-0 flex items-center justify-center bg-transparent p-0 hover:bg-gray-900",
			{
				"size-12": size === "md",
				"size-8": size === "sm",
				"size-6": size === "xs",
				"gap-2": buttonText,
			},
			className
		);
		const copyButtonIconStyle = cn(
			"fill-white",
			{
				"size-5": size === "md",
				"size-4": size === "sm",
				"size-3": size === "xs",
			},
			iconClassName
		);

		const ariaLabelText = ariaLabel || t("copyButtonText", { text: ariaLabel }) || "";
		const titleText = t("copyButtonTextTitle", { text: title }) || ariaLabelText;
		return (
			<Button
				ariaLabel={ariaLabelText}
				className={copyButtonStyle}
				data-testid={dataTestId}
				onClick={(event) => {
					event.stopPropagation();
					copyTextToClipboard(text);
				}}
				onKeyPressed={() => copyTextToClipboard(text)}
				tabIndex={tabIndex}
				title={titleText}
				type="button"
				valueText={text}
			>
				<CopyIcon className={copyButtonIconStyle} />
				{buttonText ? <div className="text-white">{buttonText}</div> : null}
			</Button>
		);
	}
);

CopyButton.displayName = "CopyButton";
