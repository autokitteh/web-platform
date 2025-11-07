import React from "react";

import { EditVariable } from "@components/organisms/variables/edit";

interface VariableEditProps {
	variableName: string;
	onBack: () => void;
}

export const VariableEdit = ({ variableName, onBack }: VariableEditProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<EditVariable onBack={onBack} onSuccess={onBack} variableName={variableName} />
		</div>
	);
};
