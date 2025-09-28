import React, { useRef, useEffect } from "react";

import { IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { useConsent } from "@src/contexts/consent";
import { cn } from "@utilities/cn.utils";

interface CookieBannerProps {
	className?: string;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ className }) => {
	const { t } = useTranslation("consent");
	const { showBanner, acceptAll, rejectAll, openPreferences, closeBanner } = useConsent();
	const bannerRef = useRef<HTMLDivElement>(null);
	const acceptButtonRef = useRef<HTMLButtonElement>(null);

	// Focus management for accessibility
	useEffect(() => {
		if (showBanner && acceptButtonRef.current) {
			// Focus the first actionable element when banner appears
			acceptButtonRef.current.focus();
		}
	}, [showBanner]);

	// Trap focus within the banner
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Tab" && bannerRef.current) {
			const focusableElements = bannerRef.current.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
			);

			const firstElement = focusableElements[0] as HTMLElement;
			const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

			if (event.shiftKey && document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			} else if (!event.shiftKey && document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		}

		// Allow ESC to close banner
		if (event.key === "Escape") {
			closeBanner();
		}
	};

	if (!showBanner) {
		return null;
	}

	return (
		<div
			aria-describedby="cookie-banner-description"
			aria-labelledby="cookie-banner-title"
			aria-modal="false"
			className={cn(
				"fixed inset-x-0 bottom-0 z-50",
				"border-t border-gray-600 bg-gray-800 shadow-lg",
				"p-4 md:p-6",
				"transition-transform duration-300 ease-in-out",
				className
			)}
			ref={bannerRef}
			role="dialog"
		>
			{/* Hidden focusable element for keyboard navigation */}
			<button className="sr-only" onKeyDown={handleKeyDown} tabIndex={0} type="button" />
			<div className="mx-auto max-w-7xl">
				{/* Close button */}
				<button
					aria-label={t("banner.close")}
					className={cn(
						"absolute right-2 top-2 md:right-4 md:top-4",
						"rounded-lg p-2 transition-colors hover:bg-gray-700",
						"focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
					)}
					onClick={closeBanner}
				>
					<IconX className="size-5 text-gray-300" />
				</button>

				<div className="pr-12 md:pr-16">
					{/* Banner content */}
					<div className="mb-4 md:mb-6">
						<h2 className="mb-2 text-lg font-semibold text-white" id="cookie-banner-title">
							{t("banner.title")}
						</h2>
						<p className="text-sm leading-relaxed text-gray-300" id="cookie-banner-description">
							{t("banner.description")}{" "}
							<button
								className="rounded text-green-400 underline hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
								onClick={openPreferences}
							>
								{t("banner.learnMore")}
							</button>
						</p>
					</div>

					{/* Action buttons */}
					<div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
						{/* Accept All - Primary action */}
						<button
							className={cn(
								"bg-green-500 px-6 py-3 text-white hover:bg-green-600",
								"rounded-lg text-sm font-medium transition-colors",
								"focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800",
								"sm:order-1"
							)}
							data-testid="accept-all-cookies"
							onClick={acceptAll}
							ref={acceptButtonRef}
						>
							{t("banner.acceptAll")}
						</button>

						{/* Reject All - Equal prominence */}
						<button
							className={cn(
								"bg-gray-600 px-6 py-3 text-white hover:bg-gray-500",
								"rounded-lg border border-gray-500 text-sm font-medium transition-colors",
								"focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800",
								"sm:order-2"
							)}
							data-testid="reject-all-cookies"
							onClick={rejectAll}
						>
							{t("banner.rejectAll")}
						</button>

						{/* Customize - Secondary action */}
						<button
							className={cn(
								"bg-gray-700 px-6 py-3 text-gray-200 hover:bg-gray-600",
								"rounded-lg border border-gray-500 text-sm font-medium transition-colors",
								"focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800",
								"sm:order-3"
							)}
							data-testid="customize-cookies"
							onClick={openPreferences}
						>
							{t("banner.customize")}
						</button>
					</div>

					{/* Legal notice */}
					<p className="mt-4 text-xs text-gray-400">{t("banner.legalNotice")}</p>
				</div>
			</div>
		</div>
	);
};
