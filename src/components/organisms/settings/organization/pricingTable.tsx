import React from "react";

import { Button, Typography } from "@components/atoms";

const PricingTable = () => {
	return (
		<div className="grid gap-8 xl:grid-cols-3">
			{/* Free Plan */}
			<div className="flex flex-col rounded-xl border border-gray-900 p-6 shadow-md">
				<Typography className="mb-4 text-lg font-bold">Free</Typography>
				<Typography className="mb-2 text-4xl font-bold">$0</Typography>
				<Typography className="mb-4 text-sm text-gray-500">Per month, Billed Annually</Typography>
				<ul className="mb-6 space-y-2 text-sm">
					<li>5 projects</li>
					<li>1000 automations</li>
					<li>3 days data retention</li>
					<li>2000 incoming events</li>
					<li>1500 minutes compute time</li>
				</ul>
			</div>

			{/* Professional Plan */}
			<div className="flex flex-col rounded-xl border border-gray-900 p-6 shadow-md">
				<Typography className="mb-4 text-lg font-bold">Professional</Typography>
				<Typography className="mb-2 text-4xl font-bold">30$</Typography>
				<Typography className="mb-4 text-sm text-gray-500">Per month, Billed Annually</Typography>
				<ul className="mb-6 space-y-2 text-sm">
					<li>10 projects</li>
					<li>5000 automations</li>
					<li>2 weeks data retention</li>
					<li>10000 incoming events</li>
					<li>3000 minutes compute time</li>
				</ul>
				<Button className="mt-auto flex justify-center font-bold text-white" variant="filled">
					Upgrade
				</Button>
			</div>

			{/* Organization Plan */}
			<div className="flex flex-col rounded-xl border border-gray-900 p-6 shadow-md">
				<Typography className="mb-4 text-lg font-bold">Enterprise</Typography>
				<Typography className="mb-2 text-4xl font-bold">Contact us</Typography>
				<Typography className="mb-4 text-sm text-gray-500">Per month, Billed Annually</Typography>
				<ul className="mb-6 space-y-2 text-sm">
					<li>Unlimited projects</li>
					<li>Unlimited automations</li>
					<li>1 year data retention</li>
					<li>Unlimited incoming events</li>
					<li>Usage-based compute time pricing</li>
				</ul>
				<Button className="mt-auto flex justify-center font-bold text-white" variant="filled">
					Get a quote
				</Button>
			</div>
		</div>
	);
};

export default PricingTable;
