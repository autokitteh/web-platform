import { ColorSchemes } from "@src/types";

export interface DrawerProps {
	children: React.ReactNode;
	name: string;
	variant?: ColorSchemes;
}
