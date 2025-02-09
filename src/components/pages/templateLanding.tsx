import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useSearchParams, Navigate } from "react-router-dom";

import { howToBuildAutomation, whatIsAutoKitteh } from "@src/constants";
import { useTemplatesStore } from "@src/store";

import { Typography, Frame } from "@components/atoms";
import { TemplateStart } from "@components/organisms";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

export const TemplateLanding = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { fetchTemplates } = useTemplatesStore();
	const [searchParams] = useSearchParams();
	const assetDir = searchParams.get("template-name");

	useEffect(() => {
		fetchTemplates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!assetDir) return <Navigate replace to="/" />;

	return (
		<Frame className="min-h-screen bg-gray-1100">
			<div className="mx-auto max-w-7xl">
				<TemplateStart assetDir={assetDir} />

				<div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
					{/* What is AutoKitteh Section */}
					<div className="rounded-2xl border-2 border-gray-800 bg-gray-900/20 p-8 text-base">
						<Typography className="mb-6 text-2xl font-bold text-white" element="h2">
							{t("whatIsAutoKitteh")}
						</Typography>
						<ol className="space-y-4">
							{whatIsAutoKitteh.map((item, index) => (
								<li className="flex gap-3 text-gray-300" key={index}>
									<span className="font-bold">{index + 1}.</span>
									{item}
								</li>
							))}
						</ol>
					</div>

					{/* How to Build Section */}
					<div className="rounded-2xl border-2 border-gray-800 bg-gray-900/20 p-8 text-base">
						<Typography className="mb-6 text-2xl font-bold text-white" element="h2">
							{t("howToBuildAnAutomation")}
						</Typography>
						<ol className="space-y-4">
							{howToBuildAutomation.map((item, index) => (
								<li className="flex gap-3 text-gray-300" key={index}>
									<span className="font-bold">{index + 1}.</span>
									{item}
								</li>
							))}
						</ol>
					</div>
				</div>

				<WelcomeVideoModal />
			</div>
		</Frame>
	);
};
