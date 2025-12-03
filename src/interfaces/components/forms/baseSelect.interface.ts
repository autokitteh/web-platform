import ReactSelect, { SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";

import { SelectGroup } from "./groupedSelect.interface";
import { SelectOption, SelectProps } from "./select.interface";

export interface BaseSelectProps extends Omit<SelectProps, "options"> {
	SelectComponent: typeof ReactSelect | typeof CreatableSelect;
	defaultValue?: SingleValue<SelectOption>;
	"aria-label"?: string;
	options?: SelectOption[];
	groups?: SelectGroup[];
}
