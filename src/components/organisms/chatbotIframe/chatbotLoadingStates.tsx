import React from "react";

import { useTranslation } from "react-i18next";

import { Button, Loader } from "@components/atoms";

interface ChatbotLoadingStatesProps {
	isLoading: boolean;
	loadError: string | null | boolean;
	onRetry: () => void;
}

export const ChatbotLoadingStates: React.FC<ChatbotLoadingStatesProps> = ({ isLoading, loadError, onRetry }) => {
	const { t } = useTranslation("chatbot", { keyPrefix: "iframeComponent" });

	if (isLoading) {
		return (
			<div className="flex size-full flex-col items-center justify-center">
				<div className="flex size-24 items-center justify-center rounded-full bg-gray-1250 p-2">
					<Loader className="mr-10" size="lg" />
				</div>
				<div className="mt-16 text-gray-500">{t("loading")}</div>
			</div>
		);
	}

	if (loadError && !isLoading) {
		return (
			<div className="flex size-full flex-col items-center justify-center">
				<div className="mb-4 text-error">{t("loadingError")}</div>
				<Button
					ariaLabel={t("ariaLabelRetry")}
					className="border-white px-4 py-2 font-semibold text-white hover:bg-black"
					onClick={onRetry}
					variant="outline"
				>
					{t("retry")}
				</Button>
			</div>
		);
	}

	return null;
};
