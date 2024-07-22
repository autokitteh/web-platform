import { useCallback, useState } from "react";

export const useSecretInput = (initialState: boolean = false) => {
	const [isLocked, setIsLocked] = useState(initialState);

	const toggleLock = useCallback(() => {
		setIsLocked((prevState) => !prevState);
	}, []);

	return { isLocked, toggleLock };
};
