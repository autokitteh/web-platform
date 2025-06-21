import React from "react";

import { CancelPlanModal } from "../user/cancelModal";
import { HttpService } from "@services/http.service";
import { useBilling } from "@src/hooks/billing/useBilling";
import { useOrganizationStore } from "@src/store/useOrganizationStore";
import { formatCompactNumber, getApiBaseUrl } from "@src/utilities";

import { Button, Typography, Tooltip } from "@components/atoms";

export const BillingOrganization = () => {
	const { plans, usage, loading } = useBilling();
	const { user, currentOrganization } = useOrganizationStore();
	const currentPlan = usage?.plan;
	const isFree = usage?.plan !== "free";

	if (loading.plans || loading.usage) {
		return (
			<div className="mr-6">
				<div className="flex items-center justify-center p-8">
					<Typography className="text-gray-500">Loading billing information...</Typography>
				</div>
			</div>
		);
	}

	const getUsageForLimit = (limitName: string) => {
		if (!usage) return null;
		return usage.usage.find((item) => item.limit === limitName);
	};
	const projectsUsage = getUsageForLimit("projects");

	const onUpgradeClick = async () => {
		if (!user || !currentOrganization) {
			// eslint-disable-next-line no-console
			console.error("User or organization not found");
			return;
		}

		// Find the professional plan to get the price ID
		const professionalPlan = plans.find((p) => p.Name.toLowerCase().includes("professional"));
		if (!professionalPlan) {
			// eslint-disable-next-line no-console
			console.error("Professional plan not found");
			return;
		}

		try {
			const baseUrl = getApiBaseUrl();

			// Create the user data header as expected by the Go middleware
			// Format: "userId:orgId" as parsed by users.ParseUserDataHeader in Go
			const userDataHeader = `${user.id}:${currentOrganization.id}`;

			// Construct success URL (you can customize this)
			const successURL = `${window.location.origin}/settings/organization/billing?success=true`;

			const stripeResponse = await HttpService.post(
				`${baseUrl}/stripe/checkout`,
				{
					stripePriceId: professionalPlan.ID, // Use the plan ID as the Stripe price ID
					successURL: successURL,
				},
				{
					headers: {
						"X-User-Data": userDataHeader,
						"Content-Type": "application/json", // Ensure JSON content type
					},
				}
			);

			// eslint-disable-next-line no-console
			console.log("[DEBUG] Stripe checkout response:", stripeResponse);

			// Redirect to Stripe checkout if we get a redirect URL
			if (stripeResponse?.data?.url) {
				window.location.href = stripeResponse.data.url;
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("Failed to create checkout session:", error);
		}
	};

	return (
		<div className="mr-6">
			<div className="grid gap-5 pb-5 font-averta xl:grid-cols-2">
				{isFree ? (
					<>
						<div className="col-span-1 flex items-center justify-between rounded-xl border border-gray-900 p-5">
							<div>
								<Typography className="mb-1 text-lg font-bold">Free</Typography>
								<Typography className="text-xs text-gray-500">
									Upgrade to unlock more features
								</Typography>
							</div>
							<Button
								className="mt-4 bg-green-800 px-4 font-bold text-black hover:bg-green-500 hover:text-white md:mt-0"
								disabled={loading.checkout}
								onClick={onUpgradeClick}
								variant="filled"
							>
								{loading.checkout ? "Processing..." : "Upgrade"}
							</Button>
						</div>

						{projectsUsage ? (
							<BillingOrganizationBlock
								label="Projects"
								max={projectsUsage.max}
								value={projectsUsage.used}
							/>
						) : null}
					</>
				) : (
					<>
						<div className="col-span-1 flex items-center justify-between rounded-xl border border-gray-900 p-5">
							<div>
								<Typography className="mb-1 text-lg font-bold capitalize">
									{currentPlan || "Professional"}
								</Typography>
								{/* <Typography className="mb-1 text-sm font-medium">{t("monthly")}</Typography>
								<Typography className="text-xs text-gray-500">
									{t("autoSubscriptionRenew")} Jun 26, 2025.
								</Typography> */}
							</div>
						</div>

						{projectsUsage ? (
							<BillingOrganizationBlock
								label="Projects"
								max={projectsUsage.max}
								value={projectsUsage.used}
							/>
						) : null}
					</>
				)}
			</div>
			<CancelPlanModal />
		</div>
	);
};

const BillingOrganizationBlock = ({ label, value, max }: { label: string; max: number; value: number }) => {
	const shortValue = formatCompactNumber(value);
	const shortMax = formatCompactNumber(max);
	const display = `${shortValue}/${shortMax}`;

	return (
		<div className="flex flex-1 flex-col justify-center rounded-xl border border-gray-900 p-5">
			<Typography className="mb-1 text-base font-bold">{label}</Typography>
			<Tooltip content={`Exact: ${value}/${max}`} position="bottom-start">
				<span className="text-xl font-bold">{display}</span>
			</Tooltip>
		</div>
	);
};
