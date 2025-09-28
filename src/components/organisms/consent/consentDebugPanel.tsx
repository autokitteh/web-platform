import React, { useState } from "react";

import { IconBug, IconRefresh, IconTrash, IconEye, IconSettings } from "@tabler/icons-react";

import { useConsent } from "@src/contexts/consent";
import { ConsentStorageService, RegionDetectionService } from "@src/services";
import type { ConsentStates } from "@src/types/consent.type";
import { cn } from "@utilities/cn.utils";

interface ConsentDebugPanelProps {
	className?: string;
}

export const ConsentDebugPanel: React.FC<ConsentDebugPanelProps> = ({ className }) => {
	const {
		isLoaded,
		hasConsent,
		consentRecord,
		purposes,
		showBanner,
		showPreferences,
		acceptAll,
		rejectAll,
		updatePurposes,
		openPreferences,
		resetConsent,
	} = useConsent();

	const [isVisible, setIsVisible] = useState(false);
	const [debugInfo, setDebugInfo] = useState<any>(null);

	// Only show in development
	if (process.env.NODE_ENV === "production") {
		return null;
	}

	const handleGetDebugInfo = () => {
		const info = {
			consentState: {
				isLoaded,
				hasConsent,
				showBanner,
				showPreferences,
				purposes,
			},
			consentRecord,
			storage: {
				cookieExists: document.cookie.includes("ak-consent"),
				localStorageExists: !!localStorage.getItem("ak-consent"),
			},
			region: RegionDetectionService.getDetectedRegion(),
			timestamp: new Date().toISOString(),
		};
		setDebugInfo(info);
	};

	const handleSimulateRegion = (region: string) => {
		// This would require extending the RegionDetectionService
		// In a real implementation, this would simulate different regional compliance profiles
		if (process.env.NODE_ENV === "development") {
			// eslint-disable-next-line no-console
			console.log(`Simulating region: ${region}`);
		}
		window.location.reload();
	};

	const handleUpdatePurpose = (purpose: string, state: "granted" | "denied") => {
		updatePurposes({ [purpose]: state } as Partial<ConsentStates>);
	};

	const handleClearStorage = () => {
		ConsentStorageService.clear();
		localStorage.removeItem("ak-consent");
		RegionDetectionService.clearCache();
		if (process.env.NODE_ENV === "development") {
			// eslint-disable-next-line no-console
			console.log("Consent storage cleared");
		}
	};

	if (!isVisible) {
		return (
			<button
				className={cn(
					"fixed bottom-4 right-4 z-50",
					"bg-green-500 p-3 text-white hover:bg-gray-700",
					"rounded-full shadow-lg transition-colors",
					"focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
					className
				)}
				onClick={() => setIsVisible(true)}
				title="Open Consent Debug Panel"
			>
				<IconBug className="size-5" />
			</button>
		);
	}

	return (
		<div
			className={cn(
				"fixed bottom-4 right-4 z-50",
				"w-96 rounded-lg border border-gray-200 bg-white shadow-xl",
				"max-h-96 overflow-y-auto",
				className
			)}
		>
			{/* Header */}
			<div className="flex items-center justify-between border-b border-gray-200 bg-gray-150 p-3">
				<div className="flex items-center gap-2">
					<IconBug className="size-4 text-green-500" />
					<span className="text-sm font-medium text-gray-900">Consent Debug</span>
				</div>
				<button
					className="rounded p-1 hover:bg-gray-250"
					onClick={() => setIsVisible(false)}
					title="Close debug panel"
				>
					<IconEye className="size-4 text-green-500" />
				</button>
			</div>

			{/* Content */}
			<div className="space-y-4 p-3">
				{/* System Status */}
				<div>
					<h4 className="mb-2 text-sm font-medium text-gray-900">System Status</h4>
					<div className="space-y-1 text-xs">
						<div className="flex justify-between">
							<span>Loaded:</span>
							<span className={isLoaded ? "text-green-700" : "text-red-500"}>{isLoaded ? "✓" : "✗"}</span>
						</div>
						<div className="flex justify-between">
							<span>Has Consent:</span>
							<span className={hasConsent ? "text-green-700" : "text-red-500"}>
								{hasConsent ? "✓" : "✗"}
							</span>
						</div>
						<div className="flex justify-between">
							<span>Banner Visible:</span>
							<span className={showBanner ? "text-green-500" : "text-gray-700"}>
								{showBanner ? "Yes" : "No"}
							</span>
						</div>
					</div>
				</div>

				{/* Quick Actions */}
				<div>
					<h4 className="mb-2 text-sm font-medium text-gray-900">Quick Actions</h4>
					<div className="grid grid-cols-2 gap-2">
						<button
							className="rounded bg-green-200 px-2 py-1 text-xs text-green-800 hover:bg-green-400"
							onClick={acceptAll}
						>
							Accept All
						</button>
						<button
							className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-850 hover:bg-gray-300"
							onClick={rejectAll}
						>
							Reject All
						</button>
						<button
							className="rounded bg-gray-150 px-2 py-1 text-xs text-gray-800 hover:bg-gray-200"
							onClick={openPreferences}
						>
							<IconSettings className="mr-1 inline size-3" />
							Preferences
						</button>
						<button
							className="rounded bg-orange-500 px-2 py-1 text-xs text-white hover:bg-gray-700"
							onClick={resetConsent}
						>
							<IconRefresh className="mr-1 inline size-3" />
							Reset
						</button>
					</div>
				</div>

				{/* Purpose Controls */}
				<div>
					<h4 className="mb-2 text-sm font-medium text-gray-900">Purpose Controls</h4>
					<div className="space-y-2">
						{Object.entries(purposes).map(([purpose, state]) => (
							<div className="flex items-center justify-between text-xs" key={purpose}>
								<span className="capitalize">{purpose.replace("-", " ")}</span>
								<div className="flex gap-1">
									<button
										className={cn(
											"rounded px-2 py-0.5 text-xs",
											state === "granted"
												? "bg-green-200 text-green-800"
												: "bg-gray-100 text-gray-600 hover:bg-gray-150"
										)}
										disabled={purpose === "strictly-necessary"}
										onClick={() => handleUpdatePurpose(purpose, "granted")}
									>
										Grant
									</button>
									<button
										className={cn(
											"rounded px-2 py-0.5 text-xs",
											state === "denied"
												? "bg-error-200 text-gray-850"
												: "bg-gray-100 text-gray-600 hover:bg-gray-150"
										)}
										disabled={purpose === "strictly-necessary"}
										onClick={() => handleUpdatePurpose(purpose, "denied")}
									>
										Deny
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Region Simulation */}
				<div>
					<h4 className="mb-2 text-sm font-medium text-gray-900">Region Simulation</h4>
					<div className="grid grid-cols-3 gap-1">
						<button
							className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
							onClick={() => handleSimulateRegion("DE")}
						>
							EEA
						</button>
						<button
							className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
							onClick={() => handleSimulateRegion("GB")}
						>
							UK
						</button>
						<button
							className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
							onClick={() => handleSimulateRegion("US")}
						>
							US
						</button>
					</div>
				</div>

				{/* Debug Info */}
				<div>
					<div className="mb-2 flex items-center gap-2">
						<h4 className="text-sm font-medium text-gray-900">Debug Info</h4>
						<button
							className="rounded bg-gray-150 px-2 py-0.5 text-xs text-green-500 hover:bg-gray-200"
							onClick={handleGetDebugInfo}
						>
							Refresh
						</button>
					</div>
					{debugInfo ? (
						<pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs">
							{JSON.stringify(debugInfo, null, 2)}
						</pre>
					) : null}
				</div>

				{/* Storage Controls */}
				<div>
					<h4 className="mb-2 text-sm font-medium text-gray-900">Storage</h4>
					<button
						className="flex items-center gap-1 rounded bg-error-200 px-2 py-1 text-xs text-gray-850 hover:bg-error"
						onClick={handleClearStorage}
					>
						<IconTrash className="size-3" />
						Clear Storage
					</button>
				</div>
			</div>
		</div>
	);
};
