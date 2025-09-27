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
	"data-testid"?: string;
}

export const OAuthProviderButton = ({
	id,
	label,
	onClick,
	disabled = false,
	className = "",
	"data-testid": dataTestId,
}: OAuthProviderButtonProps) => {
	const ProviderIcon = providerIcons[id];

	return (
		<Button
			ariaLabel={`Continue with ${label}`}
			className={`flex items-center justify-start gap-3 rounded-lg bg-white px-6 py-3 text-lg font-bold text-gray-900 hover:bg-gray-100 ${className}`}
			data-testid={dataTestId}
			disabled={disabled}
			onClick={() => onClick(id)}
			variant="ghost"
		>
			{ProviderIcon ? (
				<div className="flex w-6 items-center justify-center">
					<IconSvg className="fill-gray-900" size="xl" src={ProviderIcon} />
				</div>
			) : null}
			<span>Continue with {label}</span>
		</Button>
	);
};
