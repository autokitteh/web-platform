import React from "react";

import { EditVariable } from "@components/organisms/variables/edit";

interface ProjectSettingsVariableEditProps {
	variableName: string;
	onBack: () => void;
}

export const ProjectSettingsVariableEdit = ({ variableName, onBack }: ProjectSettingsVariableEditProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<EditVariable onBack={onBack} onSuccess={onBack} variableName={variableName} />
		</div>
	);
};
