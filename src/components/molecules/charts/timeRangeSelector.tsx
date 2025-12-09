import { Select, SelectItem } from "@tremor/react";

import { DashboardTimeRange, timeRangeOptions } from "@constants";
import { TimeRangeSelectorProps } from "@interfaces/components/dashboardStats.interface";
import { cn } from "@utilities";

export const TimeRangeSelector = ({ value, onChange, className }: TimeRangeSelectorProps) => (
	<Select
		className={cn("w-40", className)}
		onValueChange={(val) => onChange(val as DashboardTimeRange)}
		value={value}
	>
		{timeRangeOptions.map((option) => (
			<SelectItem key={option.value} value={option.value}>
				{option.label}
			</SelectItem>
		))}
	</Select>
);
