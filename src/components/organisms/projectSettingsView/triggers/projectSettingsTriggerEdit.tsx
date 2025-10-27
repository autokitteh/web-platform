import React from "react";

import { EditTrigger } from "@components/organisms/triggers/edit";

interface ProjectSettingsTriggerEditProps {
	triggerId: string;
	onBack: () => void;
}

export const ProjectSettingsTriggerEdit = ({ triggerId, onBack }: ProjectSettingsTriggerEditProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<EditTrigger hideHeader onBack={onBack} onSuccess={onBack} triggerId={triggerId} />
		</div>
	);
};
