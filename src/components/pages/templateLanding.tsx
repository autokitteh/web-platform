import React, { useEffect, useState } from "react";

import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

import { LoggerService } from "@services";
import { howToBuildAutomation, whatIsAutoKitteh } from "@src/constants";
import { TemplateMetadata } from "@src/interfaces/store";
import { useTemplatesStore } from "@src/store";

import { Typography, Frame } from "@components/atoms";
import { LoadingOverlay } from "@components/molecules";
import { TemplateStart } from "@components/organisms";
import { WelcomeVideoModal } from "@components/organisms/dashboard";

export const TemplateLanding = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const { isLoading, fetchTemplates, sortedCategories, findTemplateByAssetDirectory } = useTemplatesStore();
	const assetDir = Cookies.get("landing-template-name");
	const [shouldRedirect, setShouldRedirect] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [template, setTemplate] = useState<TemplateMetadata | undefined>(undefined);

	const fetchTemplatesAndValidate = async () => {
		if (sortedCategories?.length || isFetching) return;

		setIsFetching(true);
		setIsFetching(true);
		try {
			await fetchTemplates(true);
			const foundTemplate = findTemplateByAssetDirectory(assetDir!);
			if (!foundTemplate) {
				Cookies.remove("landing-template-name");
				setShouldRedirect(true);
			}
			setTemplate(foundTemplate);
		} catch (error) {
			LoggerService.error("templateLanding", "Failed to fetch templates:", error);
		} finally {
			setIsFetching(false);
		}
	};

	useEffect(() => {
		if (!assetDir) {
			setShouldRedirect(true);
			return;
		}

		fetchTemplatesAndValidate();

		if (sortedCategories?.length) {
			if (!assetDir) return;
			const foundTemplate = findTemplateByAssetDirectory(assetDir);
			setTemplate(foundTemplate);
			if (!foundTemplate) {
				Cookies.remove("landing-template-name");
				setShouldRedirect(true);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortedCategories, assetDir]);

	if (shouldRedirect || !assetDir || (assetDir && !template)) {
		Cookies.remove("landing-template-name");
		return <Navigate replace to="/" />;
	}

	if (isLoading || isFetching || !sortedCategories?.length) {
		return (
			<Frame className="my-1.5 h-full bg-gray-1100">
				<LoadingOverlay isLoading={true} />
			</Frame>
		);
	}

	return (
		<Frame className="my-1.5 h-full bg-gray-1100">
			<div className="mx-auto max-w-7xl px-6 pb-8">
				<TemplateStart assetDir={assetDir} />

				<div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
					<div className="relative flex flex-col space-y-6 rounded-3xl border-2 border-gray-800 bg-gradient-to-b from-gray-900/40 to-gray-900/20 p-10 shadow-lg">
						<div className="absolute -left-1 -top-1 size-16 rounded-tl-3xl border-l-4 border-t-4 border-green-800 opacity-40" />

						<Typography className="text-3xl font-bold tracking-tight text-white" element="h2">
							{t("whatIsAutoKitteh")}
						</Typography>

						<ol className="space-y-6">
							{whatIsAutoKitteh.map((item, index) => (
								<li className="flex gap-4 text-lg leading-relaxed text-gray-300/90" key={index}>
									<span className="flex size-8 items-center justify-center rounded-full bg-green-800/20 font-bold text-green-800">
										{index + 1}
									</span>
									<span className="flex-1 pt-1">{item}</span>
								</li>
							))}
						</ol>
					</div>

					<div className="relative flex flex-col space-y-6 rounded-3xl border-2 border-gray-800 bg-gradient-to-b from-gray-900/40 to-gray-900/20 p-10 shadow-lg">
						<div className="absolute -left-1 -top-1 size-16 rounded-tl-3xl border-l-4 border-t-4 border-green-800 opacity-40" />

						<Typography className="text-3xl font-bold tracking-tight text-white" element="h2">
							{t("howToBuildAnAutomation")}
						</Typography>

						<ol className="space-y-6">
							{howToBuildAutomation.map((item, index) => (
								<li className="flex gap-4 text-lg leading-relaxed text-gray-300/90" key={index}>
									<span className="flex size-8 items-center justify-center rounded-full bg-green-800/20 font-bold text-green-800">
										{index + 1}
									</span>
									<span className="flex-1 pt-1">{item}</span>
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
