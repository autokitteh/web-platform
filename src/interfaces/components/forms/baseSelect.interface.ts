import ReactSelect, { SingleValue } from "react-select";
import CreatableSelect from "react-select/creatable";

import { SelectOption, SelectProps } from "./select.interface";

export interface BaseSelectProps extends SelectProps {
	SelectComponent: typeof ReactSelect | typeof CreatableSelect;
	defaultValue?: SingleValue<SelectOption>;
	"aria-label"?: string;
}
