import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { ClarityUtils } from "@utilities/clarity.utils";

export const useClarity = () => {
	const location = useLocation();

	useEffect(() => {
		if (window.clarity) {
			window.clarity("set", "page_path", location.pathname + location.search);
		}
	}, [location]);

	return ClarityUtils;
};
