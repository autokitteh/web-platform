import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { Button } from "./buttons/button";
import { IconSvg } from "./icons";
import { AiTextAreaProps } from "@interfaces/components/forms/aiTextarea.interface";
import { cn } from "@utilities";

import { SendIcon } from "@assets/image/icons";

export const AiTextArea = forwardRef<HTMLTextAreaElement, AiTextAreaProps>(
	({ className, errors, onBlur, onChange, onFocus, onKeyDown, ...rest }, ref) => {
		const { t } = useTranslation("chatbot");
		const internalRef = useRef<HTMLTextAreaElement>(null);
		const textareaRef = internalRef;
		const [isFocused, setIsFocused] = useState(false);
		const [isBlurred, setIsBlurred] = useState(false);
		const [isEmpty, setIsEmpty] = useState(true);

		const [windowHeight, setWindowHeight] = useState(window.innerHeight);

		useEffect(() => {
			const handleResize = () => {
				setWindowHeight(window.innerHeight);
			};

			adjustHeight();

			window.addEventListener("resize", handleResize);
			return () => {
				window.removeEventListener("resize", handleResize);
				if (focusTimeoutRef.current) {
					clearTimeout(focusTimeoutRef.current);
				}
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [window]);

		const actualMinHeight = useMemo(() => {
			return (windowHeight * 5) / 100;
		}, [windowHeight]);

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

		const adjustHeight = useCallback(
			(newHeight?: number) => {
				if (!textareaRef.current) {
					return;
				}

				if (newHeight) {
					textareaRef.current.style.height = `${newHeight}px`;
					return;
				}

				const textarea = textareaRef.current;

				const currentMaxHeight = getMaxHeight();

				textarea.style.height = "auto";
				const scrollHeight = textarea.scrollHeight;
				const offsetHeight = textarea.offsetHeight;
				if (scrollHeight === offsetHeight - 4) {
					textarea.style.height = `${actualMinHeight}px`;
					return;
				}

				const computedStyle = window.getComputedStyle(textarea);
				const fontSize = parseFloat(computedStyle.fontSize);
				const lineHeight = 1.625;
				const paddingTop = parseFloat(computedStyle.paddingTop);
				const paddingBottom = parseFloat(computedStyle.paddingBottom);
				const twoRowHeight = paddingTop + paddingBottom + fontSize * lineHeight * 2;

				let calculatedHeight;
				if (scrollHeight <= twoRowHeight) {
					calculatedHeight = actualMinHeight;
				} else {
					calculatedHeight = Math.min(scrollHeight, currentMaxHeight);
				}

				textarea.style.height = `${calculatedHeight}px`;

				if (calculatedHeight === actualMinHeight && !textarea.value) {
					textarea.style.lineHeight = `${actualMinHeight - 40}px`;
				} else {
					textarea.style.lineHeight = "1.625";
				}
			},
			[actualMinHeight, getMaxHeight, textareaRef]
		);

		useEffect(() => {
			if (textareaRef.current) {
				textareaRef.current.style.height = `${actualMinHeight}px`;
			}
		}, [actualMinHeight, textareaRef]);

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

		const handleFocus = useCallback(
			(e: React.FocusEvent<HTMLTextAreaElement>) => {
				setIsFocused(true);
				setIsBlurred(false);
				const isEmpty = !e.target.value;
				if (isEmpty) {
					adjustHeight(actualMinHeight);
				} else {
					adjustHeight();
				}
				setIsEmpty(isEmpty);

				onFocus?.(e);

				if (focusTimeoutRef.current) {
					clearTimeout(focusTimeoutRef.current);
				}

				focusTimeoutRef.current = setTimeout(() => {
					setIsFocused(false);
					focusTimeoutRef.current = null;
				}, 6000);
			},
			[onFocus, actualMinHeight, adjustHeight]
		);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				const isEmpty = !e.target.value;
				if (isEmpty) {
					adjustHeight(actualMinHeight);
				} else {
					adjustHeight();
				}
				setIsEmpty(isEmpty);

				onChange?.(e);
				setTimeout(() => {
					adjustHeight();
				}, 0);
			},
			[onChange, adjustHeight, actualMinHeight]
		);

		const handleBlur = useCallback(
			(e: React.FocusEvent<HTMLTextAreaElement>) => {
				setIsFocused(false);
				setIsBlurred(true);
				setIsEmpty(!e.target.value);
				onBlur?.(e);
			},
			[onBlur]
		);

		const textAreaClass = cn(
			"w-full resize-none",
			"overflow-y-auto",
			"rounded-2xl border-2 p-1.5 px-3 pr-12 2xl:p-2 2xl:pt-0 3xl:p-2.5 3xl:pl-3 4xl:p-5",
			"bg-black/90 text-base leading-relaxed transition-all duration-300 ease-in-out",
			"whitespace-pre-wrap break-words",
			"placeholder:text-gray-700",
			"[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
			{
				"border-green-400 text-white shadow-[0_0_20px_rgba(126,211,33,0.2)]": isFocused,
				"border-green-400/30": !isFocused,
				"text-gray-400": !isFocused && !isEmpty,
				"text-gray-500": isBlurred && isEmpty,
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
						onChange={handleChange}
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
					/>
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
						<Button
							className="pointer-events-auto flex size-7 items-center justify-center rounded-lg bg-green-400 p-0 text-black hover:scale-105 hover:bg-green-500"
							disabled={isEmpty}
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
