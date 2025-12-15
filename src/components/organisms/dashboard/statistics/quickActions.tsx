import { Button } from "@components/atoms/buttons";

export const QuickActions = () => (
	<div className="rounded-xl bg-gray-1200 p-6">
		{/* <h3 className="text-lg font-semibold text-white">Quick Actions</h3> */}
		<div className="flex flex-wrap gap-3">
			<Button
				className="rounded-full border border-green-400/50 bg-transparent px-6 py-2 text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10"
				href="/"
			>
				View All Projects
			</Button>
			<Button
				className="rounded-full border border-green-400/50 bg-transparent px-6 py-2 text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10"
				href="/connections"
			>
				Manage Connections
			</Button>
			<Button
				className="rounded-full border border-green-400/50 bg-transparent px-6 py-2 text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10"
				href="/templates-library"
			>
				Browse Templates
			</Button>
			<Button
				className="rounded-full border border-green-400/50 bg-transparent px-6 py-2 text-[#bcf870] hover:border-green-400/70 hover:bg-green-400/10"
				href="/events"
			>
				View All Events
			</Button>
		</div>
	</div>
);
