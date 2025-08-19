import { Control, FieldErrors, FieldName, UseFormRegister } from "react-hook-form";

export interface FormValues {
	client_id: string;
	client_secret: string;
	tenant_id: string;
}

export interface MicrosoftTeamsOauthPrivateFormProps {
	control: Control<FormValues>;
	errors: FieldErrors<FormValues>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<FormValues>;
	setValue: (name: FieldName<FormValues>, value: string) => void;
}
