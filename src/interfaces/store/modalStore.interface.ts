export interface IModalStore {
	modals: {
		[key: string]: boolean;
	};
	openModal: (name: string) => void;
	closeModal: (name: string) => void;
}
