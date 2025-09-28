import React, { useState, useRef, useEffect } from "react";

import { IconX, IconCheck, IconExternalLink } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { consentPurposeDefinitions } from "@src/constants/consent.constants";
import { useConsent } from "@src/contexts/consent";
import type { ConsentPurpose, ConsentStates } from "@src/types/consent.type";
import { cn } from "@utilities/cn.utils";

import { Toggle } from "@components/atoms";

interface PreferencesModalProps {
	className?: string;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({ className }) => {
	const { t } = useTranslation("consent");
	const { showPreferences, purposes: currentPurposes, updatePurposes, closePreferences } = useConsent();

	const [localPurposes, setLocalPurposes] = useState<ConsentStates>(currentPurposes);
	const [activeTab, setActiveTab] = useState(0);
	const modalRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	// Update local state when current purposes change
	useEffect(() => {
		setLocalPurposes(currentPurposes);
	}, [currentPurposes]);

	// Focus management
	useEffect(() => {
		if (showPreferences && closeButtonRef.current) {
			closeButtonRef.current.focus();
		}
	}, [showPreferences]);

	// Focus trap
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape") {
			handleClose();
			return;
		}

		if (event.key === "Tab" && modalRef.current) {
			const focusableElements = modalRef.current.querySelectorAll(
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
	};

	const handlePurposeToggle = (purpose: ConsentPurpose, enabled: boolean) => {
		if (purpose === "strictly-necessary") {
			return; // Can't toggle strictly necessary
		}

		setLocalPurposes((prev) => ({
			...prev,
			[purpose]: enabled ? "granted" : "denied",
		}));
	};

	const handleSave = () => {
		updatePurposes(localPurposes);
	};

	const handleClose = () => {
		// Reset to current saved state
		setLocalPurposes(currentPurposes);
		closePreferences();
	};

	const handleAcceptAll = () => {
		const allGranted: ConsentStates = {
			"strictly-necessary": "granted",
			functional: "granted",
			analytics: "granted",
			marketing: "granted",
		};
		setLocalPurposes(allGranted);
	};

	const handleRejectAll = () => {
		const allRejected: ConsentStates = {
			"strictly-necessary": "granted",
			functional: "denied",
			analytics: "denied",
			marketing: "denied",
		};
		setLocalPurposes(allRejected);
	};

	if (!showPreferences) {
		return null;
	}

	return (
		<div
			aria-labelledby="preferences-modal-title"
			aria-modal="true"
			className={cn("fixed inset-0 z-50 overflow-y-auto", "bg-black/50 backdrop-blur-sm", className)}
		>
			<div className="flex min-h-screen items-center justify-center px-4">
				<div
					className={cn(
						"max-h-[90vh] w-full max-w-4xl rounded-lg bg-gray-800 shadow-xl",
						"flex flex-col overflow-hidden"
					)}
					ref={modalRef}
					role="dialog"
				>
					{/* Hidden focusable element for keyboard navigation */}
					<button className="sr-only" onKeyDown={handleKeyDown} tabIndex={0} type="button" />
					{/* Header */}
					<div className="flex items-center justify-between border-b border-gray-600 p-6">
						<h1 className="text-xl font-semibold text-white" id="preferences-modal-title">
							{t("preferences.title")}
						</h1>
						<button
							aria-label={t("preferences.close")}
							className={cn(
								"rounded-lg p-2 transition-colors hover:bg-gray-700",
								"focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
							)}
							onClick={handleClose}
							ref={closeButtonRef}
						>
							<IconX className="size-5 text-gray-300" />
						</button>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto">
						{/* Overview */}
						<div className="border-b border-gray-600 p-6">
							<p className="mb-4 text-gray-300">{t("preferences.description")}</p>

							{/* Quick actions */}
							<div className="flex gap-4">
								<button
									className={cn(
										"px-4 py-2 text-sm font-medium text-green-400",
										"rounded-lg transition-colors hover:bg-green-800",
										"focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800"
									)}
									onClick={handleAcceptAll}
								>
									{t("preferences.acceptAll")}
								</button>
								<button
									className={cn(
										"px-4 py-2 text-sm font-medium text-gray-300",
										"rounded-lg transition-colors hover:bg-gray-700",
										"focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
									)}
									onClick={handleRejectAll}
								>
									{t("preferences.rejectAll")}
								</button>
							</div>
						</div>

						{/* Purpose categories */}
						<div className="space-y-6 p-6">
							{consentPurposeDefinitions.map((purpose, index) => {
								const isEnabled = localPurposes[purpose.id] === "granted";
								const isRequired = purpose.required;

								return (
									<div
										className={cn(
											"overflow-hidden rounded-lg border border-gray-600",
											"transition-all duration-200",
											activeTab === index && "ring-2 ring-green-500"
										)}
										key={purpose.id}
									>
										{/* Purpose header */}
										<button
											aria-expanded={activeTab === index}
											className={cn(
												"w-full cursor-pointer select-none bg-gray-700 p-4 text-left",
												"transition-colors hover:bg-gray-600",
												activeTab === index && "bg-green-800"
											)}
											onClick={() => setActiveTab(activeTab === index ? -1 : index)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setActiveTab(activeTab === index ? -1 : index);
												}
											}}
										>
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<div className="mb-2 flex items-center gap-3">
														<h3 className="font-medium text-white">
															{purpose.title}
															{isRequired ? (
																<span className="ml-2 text-xs font-normal text-green-400">
																	({t("preferences.required")})
																</span>
															) : null}
														</h3>
													</div>
													<p className="text-sm text-gray-300">{purpose.description}</p>
												</div>

												<div className="flex items-center gap-4">
													<Toggle
														checked={isEnabled}
														onChange={(enabled) => handlePurposeToggle(purpose.id, enabled)}
														title={`${isEnabled ? t("preferences.disable") : t("preferences.enable")} ${purpose.title}`}
													/>
													<div
														className={cn(
															"transition-transform duration-200",
															activeTab === index && "rotate-180"
														)}
													>
														<svg
															className="size-5 text-gray-300"
															fill="none"
															stroke="currentColor"
															viewBox="0 0 24 24"
														>
															<path
																d="M19 9l-7 7-7-7"
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
															/>
														</svg>
													</div>
												</div>
											</div>
										</button>

										{/* Purpose details */}
										{activeTab === index ? (
											<div className="border-t border-gray-600 bg-gray-700 p-4">
												<div className="space-y-4">
													{/* Data usage examples */}
													<div>
														<h4 className="mb-2 font-medium text-white">
															{t("preferences.dataUsage")}
														</h4>
														<ul className="space-y-1 text-sm text-gray-300">
															{purpose.examples.map((example, index) => (
																<li className="flex items-start gap-2" key={index}>
																	<IconCheck className="mt-0.5 size-4 shrink-0 text-green-400" />
																	{example}
																</li>
															))}
														</ul>
													</div>

													{/* Retention period */}
													<div>
														<h4 className="mb-2 font-medium text-white">
															{t("preferences.retention")}
														</h4>
														<p className="text-sm text-gray-300">{purpose.retention}</p>
													</div>

													{/* Cookies/Technologies */}
													<div>
														<h4 className="mb-3 font-medium text-white">
															{t("preferences.technologies")}
														</h4>
														<div className="space-y-3">
															{purpose.cookies.map((cookie, index) => (
																<div
																	className="flex items-start justify-between rounded-lg bg-gray-600 p-3"
																	key={index}
																>
																	<div className="flex-1">
																		<div className="mb-1 text-sm font-medium text-white">
																			{cookie.name}
																			<span
																				className={cn(
																					"ml-2 rounded-full px-2 py-1 text-xs",
																					cookie.type === "first-party"
																						? "bg-green-800 text-green-200"
																						: "bg-orange-500 text-white"
																				)}
																			>
																				{cookie.type}
																			</span>
																		</div>
																		<p className="mb-1 text-sm text-gray-300">
																			{cookie.purpose}
																		</p>
																		<div className="flex gap-4 text-xs text-gray-400">
																			<span>
																				{t("preferences.provider")}:{" "}
																				{cookie.provider}
																			</span>
																			<span>
																				{t("preferences.duration")}:{" "}
																				{cookie.duration}
																			</span>
																		</div>
																	</div>
																	{cookie.provider !== "AutoKitteh" ? (
																		<button
																			aria-label={t("preferences.viewProvider", {
																				provider: cookie.provider,
																			})}
																			className={cn(
																				"p-1 text-gray-400 hover:text-green-400",
																				"rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-600"
																			)}
																			title={t("preferences.viewProvider", {
																				provider: cookie.provider,
																			})}
																		>
																			<IconExternalLink className="size-4" />
																		</button>
																	) : null}
																</div>
															))}
														</div>
													</div>
												</div>
											</div>
										) : null}
									</div>
								);
							})}
						</div>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between border-t border-gray-600 bg-gray-700 p-6">
						<p className="text-sm text-gray-300">{t("preferences.footer")}</p>
						<div className="flex gap-3">
							<button
								className={cn(
									"px-4 py-2 text-sm font-medium text-gray-300",
									"rounded-lg transition-colors hover:bg-gray-600",
									"focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-700"
								)}
								onClick={handleClose}
							>
								{t("preferences.cancel")}
							</button>
							<button
								className={cn(
									"bg-green-500 px-6 py-2 text-white hover:bg-green-600",
									"rounded-lg text-sm font-medium transition-colors",
									"focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-700"
								)}
								data-testid="save-preferences"
								onClick={handleSave}
							>
								{t("preferences.save")}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
