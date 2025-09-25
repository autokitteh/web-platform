import { NavigateFunction } from "react-router-dom";

export interface SidebarProps {
	location?: { pathname: string };
	navigate?: NavigateFunction | ((path: string) => void);
}
