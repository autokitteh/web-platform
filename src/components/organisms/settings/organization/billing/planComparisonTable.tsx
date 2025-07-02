import React from "react";

import { useTranslation } from "react-i18next";

import { Typography } from "@src/components/atoms";
import { salesEmail, getBillingPlanFeatures } from "@src/constants";

export const PlanComparisonTable = () => {
	const { t } = useTranslation("billing");
	const billingPlanFeatures = getBillingPlanFeatures(t);

	return (
		<div className="flex flex-col rounded-lg border border-gray-900 bg-gray-950 p-6 pb-3">
			<Typography className="mb-6 text-lg font-semibold" element="h2">
				{t("planComparison")}
			</Typography>

			<div className="flex flex-1 flex-col">
				<div className="mb-4 grid grid-cols-4 gap-4 border-b border-gray-800 pb-3">
					<Typography className="font-medium text-gray-400">{t("columnHeaders.feature")}</Typography>
					<div className="text-center">
						<Typography className="font-medium text-gray-400">{t("columnHeaders.free")}</Typography>
					</div>
					<div className="text-center">
						<Typography className="font-bold text-green-800">{t("columnHeaders.professional")}</Typography>
					</div>
					<div className="text-center">
						<Typography className="font-bold text-gold-500">{t("columnHeaders.enterprise")}</Typography>
					</div>
				</div>

				<div className="flex flex-1 flex-col justify-between">
					{billingPlanFeatures.map(({ name, free, pro, enterprise, isPrice }, index) => (
						<div className="grid grid-cols-4 gap-4 py-3" key={index}>
							<Typography className="font-medium text-white">{name}</Typography>
							<div className="text-center">
								<Typography className="text-gray-400">{free}</Typography>
							</div>
							<div className="text-center">
								<Typography className="font-bold text-green-800">{pro}</Typography>
							</div>
							<div className="text-center">
								{isPrice ? (
									<a
										className="rounded bg-gold-500 px-3 py-2 text-sm font-bold text-black hover:bg-gold-600"
										href={`mailto:${salesEmail}`}
									>
										{enterprise}
									</a>
								) : (
									<Typography className="font-bold text-gold-500">{enterprise}</Typography>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
