import { SelectProps } from "@interfaces/components";

export interface ITimezoneOption {
	value: string;
	label: string;
	abbrev?: string;
	altName?: string;
	offset?: number;
}

export interface TimezoneSelectProps extends Omit<SelectProps, "options" | "value" | "onChange"> {
	value?: string;
	onChange?: (timezone: ITimezoneOption) => void;
}
