export interface BillingFeature {
	name: string;
	free: string;
	pro: string;
}

export interface BillingSwitcherProps {
	selectedType: string;
	onTypeChange: (type: string) => void;
}
