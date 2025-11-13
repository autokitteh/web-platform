export interface UserFeedbackFormProps {
	isOpen: boolean;
	onClose: () => void;
	className?: string;
}

export interface UserFeedbackPayload {
	url: string;
	dateTime: string;
	name: string;
	email: string;
	message: string;
	screenshot?: string | null;
}
