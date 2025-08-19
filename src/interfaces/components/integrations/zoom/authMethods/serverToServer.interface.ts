import { FieldErrors, UseFormRegister } from "react-hook-form";

export interface ZoomServerToServerFormProps {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [key: string]: any }>;
	setValue: (name: string, value: any) => void;
}
