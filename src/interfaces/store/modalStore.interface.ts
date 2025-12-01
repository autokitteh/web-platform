export interface ModalStore<T = unknown> {
	closeAllModals: () => void;
	closeModal: (name: string) => void;
	data?: T; // Deprecated: use modalData instead
	modalData: {
		[key: string]: T;
	};
	modals: {
		[key: string]: boolean;
	};
	openModal: (name: string, data?: T) => void;
	isModalOpen: (name: string) => boolean;
	getModalData: <T = unknown>(name: string) => T | undefined;
}
