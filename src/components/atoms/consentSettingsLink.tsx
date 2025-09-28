import React from "react";

import { IconSettings } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { useConsent } from "@src/contexts/consent";
import { cn } from "@utilities/cn.utils";

interface ConsentSettingsLinkProps {
	className?: string;
	variant?: "link" | "button";
	showIcon?: boolean;
}

export const ConsentSettingsLink: React.FC<ConsentSettingsLinkProps> = ({
	className,
	variant = "link",
	showIcon = true,
}) => {
	const { t } = useTranslation("consent");
	const { openPreferences } = useConsent();

	const baseClasses = cn(
		"inline-flex items-center gap-2 text-sm transition-colors",
		"rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
	);

	const variantClasses = {
		link: "text-blue-600 hover:text-blue-800 underline",
		button: "px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium",
	};

	return (
		<button
			className={cn(baseClasses, variantClasses[variant], className)}
			data-testid="cookie-settings-link"
			onClick={openPreferences}
		>
			{showIcon ? <IconSettings className="size-4" /> : null}
			{t("settings.cookieSettings")}
		</button>
	);
};
