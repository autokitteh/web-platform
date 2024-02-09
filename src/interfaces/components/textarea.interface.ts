export interface ITextArea extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error: boolean;
	disabled: boolean;
	placeholder: string;
	className: string;
}
