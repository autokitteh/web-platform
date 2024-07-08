export interface ModalStore<T = unknown> {
	closeModal: (name: string) => void;
	data?: T;
	modals: {
		[key: string]: boolean;
	};
	openModal: (name: string, data?: T) => void;
}
