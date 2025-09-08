import React from "react";

import { useTranslation } from "react-i18next";

import { IconSvg } from "@components/atoms";

import { ArrowDown } from "@assets/image/icons";

interface DiffNavigationToolbarProps {
	canNavigateNext: boolean;
	canNavigatePrevious: boolean;
	onNext: () => void;
	onPrevious: () => void;
	className?: string;
}

export const DiffNavigationToolbar: React.FC<DiffNavigationToolbarProps> = ({
	canNavigateNext,
	canNavigatePrevious,
	onNext,
	onPrevious,
	className = "",
}) => {
	const { t } = useTranslation("chatbot");

	return (
		<div className={`flex items-center gap-1 rounded-md bg-gray-800 p-1 ${className}`}>
			<button
				className={`flex size-6 items-center justify-center rounded text-xs transition-colors ${
					canNavigatePrevious
						? "text-gray-300 hover:bg-gray-700 hover:text-white"
						: "cursor-not-allowed text-gray-600"
				}`}
				disabled={!canNavigatePrevious}
				onClick={onPrevious}
				title={t("diffNavigation.previousChange")}
				type="button"
			>
				<IconSvg className="rotate-180" size="md" src={ArrowDown} />
			</button>
			<button
				className={`flex size-6 items-center justify-center rounded text-xs transition-colors ${
					canNavigateNext
						? "text-gray-300 hover:bg-gray-700 hover:text-white"
						: "cursor-not-allowed text-gray-600"
				}`}
				disabled={!canNavigateNext}
				onClick={onNext}
				title={t("diffNavigation.nextChange")}
				type="button"
			>
				<IconSvg size="md" src={ArrowDown} />
			</button>
		</div>
	);
};
