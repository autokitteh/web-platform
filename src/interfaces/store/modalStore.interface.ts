export interface IModalStore<T = unknown> {
	modals: {
		[key: string]: boolean;
	};
	data?: T;
	openModal: (name: string, data?: T) => void;
	closeModal: (name: string) => void;
}
