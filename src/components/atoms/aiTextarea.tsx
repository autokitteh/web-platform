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
		const [isFocused, setIsFocused] = useState(false);

		const [windowHeight, setWindowHeight] = useState(window.innerHeight);

		useEffect(() => {
			const handleResize = () => {
				setWindowHeight(window.innerHeight);
			};

			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, []);

		const actualMinHeight = useMemo(() => {
			// Responsive min height based on screen size
			let responsiveMinHeightVh = minHeightVh;
			if (responsiveMinHeightVh === undefined) {
				// Default responsive behavior
				if (windowHeight >= 1600) {
					// Large screens (2K+): larger minimum height
					responsiveMinHeightVh = 12;
				} else if (windowHeight >= 1200) {
					// Medium screens: moderate height
					responsiveMinHeightVh = 10;
				} else {
					// Small screens: smaller height to save space
					responsiveMinHeightVh = 8;
				}
			}
			return (windowHeight * responsiveMinHeightVh) / 100;
		}, [minHeightVh, windowHeight]);

		const getMaxHeight = useCallback(() => {
			const viewportHeight = window.innerHeight;

			if (maxHeightVh !== undefined) {
				return (viewportHeight * maxHeightVh) / 100;
			}

			// Responsive max height based on screen size
			let responsiveMaxHeightVh;
			if (viewportHeight >= 1400) {
				// Large screens (2K+): allow much more growth to utilize space
				responsiveMaxHeightVh = 70;
			} else if (viewportHeight >= 1000) {
				// Medium screens: moderate max height
				responsiveMaxHeightVh = 40;
			} else if (viewportHeight >= 800) {
				// Small-medium screens: reasonable growth
				responsiveMaxHeightVh = 30;
			} else {
				// Small screens: limit height to preserve space for buttons
				responsiveMaxHeightVh = 25;
			}
			return (viewportHeight * responsiveMaxHeightVh) / 100;
		}, [maxHeightVh]);
		const adjustHeight = useCallback(() => {
			if (!autoGrow || !textareaRef.current) {
				return;
			}

			const textarea = textareaRef.current;

			const currentMaxHeight = getMaxHeight();

			textarea.style.height = "auto";

			const scrollHeight = textarea.scrollHeight;
			const newHeight = Math.min(Math.max(scrollHeight, actualMinHeight), currentMaxHeight);

			textarea.style.height = `${newHeight}px`;
		}, [autoGrow, actualMinHeight, getMaxHeight, textareaRef]);

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
				setIsFocused(true);
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
				setIsFocused(false);
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
				maxHeight: `${maxHeightVh || 27}vh`,
				minHeight: `${minHeightVh || 8}vh`,
				overflowY: "auto" as const,
			};
		}, [autoGrow, maxHeightVh, minHeightVh]);

		const textAreaClass = cn(
			"w-full resize-none",
			autoGrow ? "overflow-y-auto" : "overflow-hidden",
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
				{isFocused ? (
					<div className="absolute -top-7 left-0 z-10">
						<span className="rounded-md bg-black/60 px-2 py-1 text-xs text-green-200">
							Press Shift+Enter to start a new line
						</span>
					</div>
				) : null}
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
