import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { Button } from "./buttons/button";
import { IconSvg } from "./icons";
import { AiTextAreaProps } from "@interfaces/components/forms/aiTextarea.interface";
import { cn, getTextareaHeight } from "@utilities";

import { SendIcon } from "@assets/image/icons";

export const AiTextArea = forwardRef<HTMLTextAreaElement, AiTextAreaProps>(
	({ className, errors, onChange, onKeyDown, prompt, ...rest }, ref) => {
		const { t } = useTranslation("chatbot");
		const internalRef = useRef<HTMLTextAreaElement>(null);
		const textareaRef = internalRef;
		const [isFocused, setIsFocused] = useState(false);
		const [isBlurred, setIsBlurred] = useState(false);
		const [windowHeight, setWindowHeight] = useState(window.innerHeight);
		const [oneRowHeight, setOneRowHeight] = useState<number>(0);

		const getMaxHeight = useCallback(() => {
			const viewportHeight = window.innerHeight;

			let responsiveMaxHeightVh;
			if (viewportHeight >= 1400) {
				responsiveMaxHeightVh = 70;
			} else if (viewportHeight >= 1000) {
				responsiveMaxHeightVh = 40;
			} else if (viewportHeight >= 800) {
				responsiveMaxHeightVh = 30;
			} else {
				responsiveMaxHeightVh = 25;
			}

			return (viewportHeight * responsiveMaxHeightVh) / 100;
		}, []);

		const adjustHeight = (newHeight?: number) => {
			if (!textareaRef.current) {
				return;
			}

			if (newHeight) {
				textareaRef.current.style.height = `${newHeight}px`;
				return;
			}
			const textarea = textareaRef.current;

			textarea.style.height = `${oneRowHeight}px`;

			if (textarea.scrollHeight <= oneRowHeight) return;
			textarea.style.height = "auto";

			const scrollHeight = textarea.scrollHeight;
			const currentMaxHeight = getMaxHeight();
			const calculatedHeight = Math.min(scrollHeight, currentMaxHeight);
			textarea.style.height = `${calculatedHeight}px`;
		};

		useLayoutEffect(() => {
			if (textareaRef.current) {
				const oneRowHeightCalc = getTextareaHeight(textareaRef.current);
				setOneRowHeight(oneRowHeightCalc);
				textareaRef.current.style.height = `${oneRowHeightCalc}px`;
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		useEffect(() => {
			const handleResize = () => {
				setWindowHeight(window.innerHeight);
			};

			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, []);

		useEffect(() => {
			adjustHeight();

			return () => {
				if (focusTimeoutRef.current) {
					clearTimeout(focusTimeoutRef.current);
				}
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [windowHeight, prompt]);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
				if (e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					const form = e.currentTarget.closest("form");
					if (form) {
						try {
							form.requestSubmit();
						} catch {
							const submitEvent = new Event("submit", {
								bubbles: true,
								cancelable: true,
							});
							form.dispatchEvent(submitEvent);
						}
					}
				} else if (e.key === "Enter" && e.shiftKey) {
					return;
				}
				onKeyDown?.(e);
			},
			[onKeyDown]
		);

		const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const handleFocus = (_e: React.FocusEvent<HTMLTextAreaElement>) => {
			setIsFocused(true);
			setIsBlurred(false);
			if (focusTimeoutRef.current) {
				clearTimeout(focusTimeoutRef.current);
			}
			focusTimeoutRef.current = setTimeout(() => {
				setIsFocused(false);
				focusTimeoutRef.current = null;
			}, 6000);
		};

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const handleBlur = (_e: React.FocusEvent<HTMLTextAreaElement>) => {
			setIsFocused(false);
			setIsBlurred(true);
		};

		const textAreaClass = cn(
			"w-full resize-none",
			"overflow-y-auto",
			"rounded-2xl border-2 px-3 py-4 pr-10 2xl:px-3 2xl:py-2.5 2xl:pr-12 3xl:p-3 3xl:pr-12 4xl:py-5 4xl:pt-[19px]",
			"bg-black/90 text-base leading-relaxed transition-all duration-300 ease-in-out",
			"whitespace-pre-wrap break-words",
			"placeholder:text-gray-700",
			"[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
			{
				"border-green-400 text-white shadow-[0_0_20px_rgba(126,211,33,0.2)]": isFocused,
				"border-green-400/30": !isFocused,
				"text-gray-400": !isFocused && !prompt,
				"text-gray-500": isBlurred && !prompt,
				"border-error": errors?.message,
			},
			className
		);

		return (
			<div className="relative my-auto mb-6 w-full">
				{isFocused ? (
					<div className="absolute -top-7 left-0 z-10">
						<span className="rounded-md bg-black/60 px-2 py-1 text-xs text-green-200">
							{t("aiTextarea.shiftEnterHint")}
						</span>
					</div>
				) : null}
				<div className="relative flex w-full items-stretch">
					<textarea
						{...rest}
						className={textAreaClass}
						onBlur={handleBlur}
						onChange={onChange}
						onFocus={handleFocus}
						onKeyDown={handleKeyDown}
						placeholder={t("aiTextarea.placeholder")}
						ref={(element) => {
							(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
							if (typeof ref === "function") {
								ref(element);
							} else if (ref) {
								(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
							}
						}}
						rows={3}
					/>
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
						<Button
							className="pointer-events-auto flex size-7 items-center justify-center rounded-lg bg-green-400 p-0 text-black hover:scale-105 hover:bg-green-500"
							disabled={!prompt}
							type="submit"
						>
							<IconSvg className="flex items-center justify-center" src={SendIcon} />
						</Button>
					</div>
				</div>
				{errors?.message && typeof errors.message === "object" && "message" in errors.message ? (
					<p className="absolute -bottom-5.5 text-error">
						{(errors.message as { message?: string }).message}
					</p>
				) : null}
			</div>
		);
	}
);

AiTextArea.displayName = "AiTextArea";
