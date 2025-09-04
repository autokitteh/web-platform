import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AiTextAreaProps } from "@interfaces/components/forms/aiTextarea.interface";
import { cn } from "@utilities";

export const AiTextArea = forwardRef<HTMLTextAreaElement, AiTextAreaProps>(
	(
		{
			className,
			onBlur,
			onChange,
			onEnterSubmit = true,
			onFocus,
			onKeyDown,
			onShiftEnterNewLine = true,
			onSubmitIconHover,
			placeholder = "Build workflows in plain English...",
			submitIcon,
			hasClearedTextarea = false,
			onClearTextarea,
			defaultPlaceholderText = "When webhook is received, send a Slack message to #alerts channel",
			autoGrow = true,
			minHeightVh = 8,
			maxHeightVh,
			...rest
		},
		ref
	) => {
		const internalRef = useRef<HTMLTextAreaElement>(null);
		const textareaRef = internalRef;

		const [windowHeight, setWindowHeight] = useState(window.innerHeight);

		useEffect(() => {
			const handleResize = () => {
				setWindowHeight(window.innerHeight);
			};

			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, []);

		const actualMinHeight = useMemo(() => {
			return (windowHeight * (minHeightVh || 8)) / 100;
		}, [minHeightVh, windowHeight]);

		const actualMaxHeight = useMemo(() => {
			const calculateAvailableHeight = () => {
				if (typeof window === "undefined") return 400;

				const viewportHeight = window.innerHeight;
				const oneRemInPx = 16;

				const header = document.querySelector("header");
				const main = document.querySelector("main");
				const textareaContainer = document.querySelector(".relative.mx-auto.mb-6.max-w-700");

				let usedHeight = 0;

				if (header) {
					usedHeight += header.offsetHeight;
				}

				if (main && textareaContainer) {
					const mainRect = main.getBoundingClientRect();
					const textareaRect = textareaContainer.getBoundingClientRect();

					const spaceAboveTextarea = textareaRect.top - mainRect.top;
					const spaceBelowTextarea = mainRect.bottom - textareaRect.bottom;

					usedHeight += spaceAboveTextarea + spaceBelowTextarea;
				} else {
					usedHeight += 200;
				}

				usedHeight += 80;

				const availableHeight = Math.max(200, viewportHeight - usedHeight - oneRemInPx);

				if (maxHeightVh !== undefined) {
					return Math.min((viewportHeight * maxHeightVh) / 100, availableHeight);
				}

				return availableHeight;
			};

			return calculateAvailableHeight();
		}, [maxHeightVh]);
		const adjustHeight = useCallback(() => {
			if (!autoGrow || !textareaRef.current) {
				return;
			}

			const textarea = textareaRef.current;

			const currentMaxHeight = (() => {
				const viewportHeight = window.innerHeight;
				const oneRemInPx = 16;

				const header = document.querySelector("header");
				const main = document.querySelector("main");
				const textareaContainer = textarea.closest(".relative.mx-auto.mb-6.max-w-700");

				let usedHeight = 0;

				if (header) {
					usedHeight += header.offsetHeight;
				}

				if (main && textareaContainer) {
					const mainRect = main.getBoundingClientRect();
					const textareaRect = textareaContainer.getBoundingClientRect();

					const spaceAboveTextarea = textareaRect.top - mainRect.top;
					const spaceBelowTextarea = mainRect.bottom - textareaRect.bottom;

					usedHeight += spaceAboveTextarea + spaceBelowTextarea;
				} else {
					usedHeight += 200;
				}

				usedHeight += 80;

				const availableHeight = Math.max(200, viewportHeight - usedHeight - oneRemInPx);

				if (maxHeightVh !== undefined) {
					return Math.min((viewportHeight * maxHeightVh) / 100, availableHeight);
				}

				return availableHeight;
			})();

			textarea.style.height = "auto";

			const scrollHeight = textarea.scrollHeight;
			const newHeight = Math.min(Math.max(scrollHeight, actualMinHeight), currentMaxHeight);

			textarea.style.height = `${newHeight}px`;
		}, [autoGrow, actualMinHeight, maxHeightVh, textareaRef]);

		useEffect(() => {
			adjustHeight();
		}, [adjustHeight]);

		useEffect(() => {
			if (autoGrow && textareaRef.current) {
				textareaRef.current.style.height = `${actualMinHeight}px`;
			}
		}, [autoGrow, actualMinHeight, textareaRef]);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
				if (onEnterSubmit && e.key === "Enter" && !e.shiftKey) {
					e.preventDefault();
					const form = e.currentTarget.form;
					if (form) {
						form.requestSubmit();
					}
				} else if (onShiftEnterNewLine && e.key === "Enter" && e.shiftKey) {
					return;
				}
				onKeyDown?.(e);
			},
			[onKeyDown, onEnterSubmit, onShiftEnterNewLine]
		);

		const handleFocus = useCallback(
			(e: React.FocusEvent<HTMLTextAreaElement>) => {
				e.target.style.borderColor = "#7ed321";
				e.target.style.boxShadow = "0 0 20px rgba(126, 211, 33, 0.2)";
				e.target.style.color = "#ffffff";
				if (!hasClearedTextarea && e.target.value === defaultPlaceholderText) {
					e.target.value = "";
					onClearTextarea?.(true);
				}
				onFocus?.(e);
			},
			[onFocus, hasClearedTextarea, defaultPlaceholderText, onClearTextarea]
		);

		const handleChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				onChange?.(e);
				setTimeout(() => {
					adjustHeight();
				}, 0);
			},
			[onChange, adjustHeight]
		);

		const handleBlur = useCallback(
			(e: React.FocusEvent<HTMLTextAreaElement>) => {
				e.target.style.borderColor = "rgba(126, 211, 33, 0.3)";
				e.target.style.boxShadow = "none";
				if (!e.target.value) {
					e.target.style.color = "#888";
				}
				onBlur?.(e);
			},
			[onBlur]
		);

		const dynamicStyles = useMemo(() => {
			if (autoGrow) return {};
			return {
				maxHeight: maxHeightVh ? `${maxHeightVh}vh` : `${actualMaxHeight}px`,
				minHeight: `${minHeightVh || 8}vh`,
				overflowY: "auto" as const,
			};
		}, [autoGrow, maxHeightVh, minHeightVh, actualMaxHeight]);

		const textAreaClass = cn(
			"w-full resize-none overflow-hidden",
			"rounded-2xl border-2 border-green-400/30 p-5 pr-16",
			"bg-black/90 text-base text-gray-400 transition-all duration-300 ease-in-out",
			autoGrow ? "whitespace-pre-wrap break-words" : "",
			"focus:border-green-400 focus:text-white focus:shadow-[0_0_20px_rgba(126,211,33,0.2)]",
			"placeholder:text-gray-400",
			className
		);

		const submitButtonClass = cn(
			"absolute flex cursor-pointer items-center justify-center border-none",
			"transition-all duration-300 ease-in-out",
			"right-3 top-1/2 -translate-y-1/2",
			"size-9 rounded-lg bg-green-400 text-black",
			"hover:scale-105 hover:bg-green-500"
		);

		return (
			<div className="relative mx-auto mb-6 max-w-700">
				<textarea
					{...rest}
					className={textAreaClass}
					onBlur={handleBlur}
					onChange={handleChange}
					onFocus={handleFocus}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					ref={(element) => {
						(textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
						if (typeof ref === "function") {
							ref(element);
						} else if (ref) {
							(ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
						}
					}}
					style={dynamicStyles}
				/>
				{submitIcon ? (
					<button
						className={submitButtonClass}
						onMouseEnter={() => onSubmitIconHover?.(true)}
						onMouseLeave={() => onSubmitIconHover?.(false)}
						type="submit"
					>
						{submitIcon}
					</button>
				) : null}
			</div>
		);
	}
);

AiTextArea.displayName = "AiTextArea";
