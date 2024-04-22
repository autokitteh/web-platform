export interface TextArea extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	isError: boolean;
	disabled: boolean;
	placeholder: string;
	className: string;
}
