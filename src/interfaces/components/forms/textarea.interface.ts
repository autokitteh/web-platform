export interface TextArea extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	className?: string;
	disabled?: boolean;
	isError: boolean;
	placeholder: string;
	isRequired?: boolean;
	label?: string;
}
