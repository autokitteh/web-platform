import { useCallback, useState } from "react";

import { LocksState, UseSecretInputsReturn } from "@interfaces/components";

export const useSecretInputs = (initialStates: LocksState): UseSecretInputsReturn => {
	const [locks, setLocks] = useState<LocksState>(initialStates);

	const toggleLock = useCallback((key: string) => {
		setLocks((prevLocks: Record<string, boolean>) => ({
			...prevLocks,
			[key]: !prevLocks[key],
		}));
	}, []);

	return { locks, toggleLock };
};
