import React from "react";

import { useTranslation } from "react-i18next";

import { AvatarProps } from "@src/types/components";
import { cn } from "@src/utilities";

export const Avatar = ({ name, src, size = "md", className }: AvatarProps) => {
	const { t } = useTranslation("components");

	const sizeMap = {
		sm: "size-8 text-sm",
		md: "size-10 text-base",
		lg: "size-14 text-lg",
	};

	const initials = name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	const avatarClass = cn(
		"inline-flex items-center justify-center overflow-hidden rounded-full bg-gray-200 font-semibold text-gray-700",
		sizeMap[size],
		className
	);

	return (
		<div aria-label={t("avatar.ariaLabel", { name })} className={avatarClass} role="img">
			{src ? (
				<img
					alt={name}
					className="size-full object-cover"
					onError={(e) => {
						(e.target as HTMLImageElement).style.display = "none";
					}}
					src={src}
				/>
			) : (
				initials
			)}
		</div>
	);
};
