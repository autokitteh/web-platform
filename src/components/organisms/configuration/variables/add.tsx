import React from "react";

import { AddVariable } from "@components/organisms/variables/add";

interface VariableAddProps {
	onBack: () => void;
}

export const VariableAdd = ({ onBack }: VariableAddProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<AddVariable onBack={onBack} onSuccess={onBack} />
		</div>
	);
};
