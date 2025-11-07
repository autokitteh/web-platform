import React from "react";

import { EditTrigger } from "@components/organisms/triggers/edit";

interface TriggerEditProps {
	triggerId: string;
	onBack: () => void;
}

export const TriggerEdit = ({ triggerId, onBack }: TriggerEditProps) => {
	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<EditTrigger onBack={onBack} onSuccess={onBack} triggerId={triggerId} />
		</div>
	);
};
