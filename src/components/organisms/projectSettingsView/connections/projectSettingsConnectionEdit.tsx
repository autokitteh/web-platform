import React from "react";

import { EditConnection } from "@components/organisms/connections/edit";

interface ProjectSettingsConnectionEditProps {
	connectionId: string;
	onBack: () => void;
}

export const ProjectSettingsConnectionEdit = ({ connectionId, onBack }: ProjectSettingsConnectionEditProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<EditConnection connectionId={connectionId} onBack={onBack} />
		</div>
	);
};
