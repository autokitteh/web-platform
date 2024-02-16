export interface ITextArea extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	isError: boolean;
	disabled: boolean;
	placeholder: string;
	className: string;
}
