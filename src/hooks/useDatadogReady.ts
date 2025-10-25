import { useEffect, useState } from "react";

export const useDatadogReady = (): boolean => {
	const [isDatadogReady, setIsDatadogReady] = useState(!!window.DD_RUM);

	useEffect(() => {
		if (window.DD_RUM) {
			setIsDatadogReady(true);
			return;
		}

		const checkDatadog = setInterval(() => {
			if (window.DD_RUM) {
				setIsDatadogReady(true);
				clearInterval(checkDatadog);
			}
		}, 100);

		return () => clearInterval(checkDatadog);
	}, []);

	return isDatadogReady;
};
