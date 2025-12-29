import React, { useState } from "react";

import { LuSearch } from "react-icons/lu";

import { CodeFilesSection } from "./codeFilesSection";
import { ConnectionsSection } from "./connectionsSection";
import { TriggerSection } from "./triggerSection";
import { VariablesSection } from "./variablesSection";

import { Input, Typography } from "@components/atoms";

export const WorkflowSidebar = () => {
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<aside className="flex h-full w-72 flex-col border-r border-gray-750 bg-gray-1100">
			<div className="border-b border-gray-750 p-4">
				<Typography className="text-white" variant="h3">
					Components
				</Typography>
				<Typography className="mt-1 text-gray-400" element="p" size="small">
					Drag items to build your workflow
				</Typography>
			</div>

			<div className="border-b border-gray-750 p-4">
				<div className="relative">
					<LuSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
					<Input
						className="!bg-gray-900 !pl-9"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search components..."
						value={searchQuery}
					/>
				</div>
			</div>

			<div className="scrollbar flex-1 overflow-y-auto">
				<TriggerSection />
				<CodeFilesSection />
				<ConnectionsSection />
				<VariablesSection />
			</div>
		</aside>
	);
};
