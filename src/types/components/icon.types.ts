import { IconSize } from "@type";

export type IconSizeClasses = {
	[K in IconSize]: string;
};

export const iconSizeClasses: IconSizeClasses = {
	xs: "w-2 h-2",
	sm: "w-3 h-3",
	md: "w-4 h-4",
	"2md": "size-[1.1rem]",
	lg: "w-5 h-5",
	xl: "w-6 h-6",
	"2xl": "w-8 h-8",
	"3xl": "w-10 h-10",
	"36": "w-36 h-36",
};
