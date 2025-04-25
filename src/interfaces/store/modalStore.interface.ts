export interface ModalStore<T = unknown> {
	closeAllModals: () => void;
	closeModal: (name: string) => void;
	data?: T;
	modals: {
		[key: string]: boolean;
	};
	openModal: (name: string, data?: T) => void;
}
