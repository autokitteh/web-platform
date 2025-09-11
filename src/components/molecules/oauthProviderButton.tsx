import React from "react";

import { Button, IconSvg } from "@components/atoms";

import { GithubIcon, GoogleIcon, MicrosoftTeamsIcon } from "@assets/image/icons/connections";

const providerIcons = {
	github: GithubIcon,
	google: GoogleIcon,
	microsoft: MicrosoftTeamsIcon,
} as const;

export interface OAuthProviderButtonProps {
	id: "github" | "google" | "microsoft";
	label: string;
	onClick: (provider: "github" | "google" | "microsoft") => void;
	disabled?: boolean;
	className?: string;
}

export const OAuthProviderButton = ({
	id,
	label,
	onClick,
	disabled = false,
	className = "",
}: OAuthProviderButtonProps) => {
	const ProviderIcon = providerIcons[id];

	return (
		<Button
			ariaLabel={`Continue with ${label}`}
			className={`flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-bold text-gray-900 hover:bg-gray-100 ${className}`}
			disabled={disabled}
			onClick={() => onClick(id)}
			variant="ghost"
		>
			{ProviderIcon ? <IconSvg className="fill-gray-900" size="md" src={ProviderIcon} /> : null}
			Continue with {label}
		</Button>
	);
};
