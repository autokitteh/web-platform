export interface LocksState {
	[key: string]: boolean;
}

export interface UseSecretInputsReturn {
	locks: LocksState;
	toggleLock: (key: string) => void;
}
