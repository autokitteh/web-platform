import React, { ReactNode } from "react";

import { LoginIntegrationsLogoPng } from "@assets/image";
import { GithubIcon } from "@assets/image/icons/connections";

export const DescopeMiddleware = ({ children }: { children: ReactNode }) => {
	return (
		<div className="flex h-screen bg-white">
			{/* Left side */}

			<div className="flex w-1/3 flex-col items-start justify-center p-8">
				<div className="mb-8 flex items-center">
					<div className="mr-2 h-10 w-10 rounded-full bg-black" />

					<div>
						<h2 className="text-xl font-bold">autokitteh</h2>

						<p className="text-sm text-gray-500">Complex automation made simple</p>
					</div>
				</div>

				<h1 className="mb-8 text-4xl font-bold">
					Welcome to <span className="bg-green-300 rounded px-2">autokitteh</span>
				</h1>

				<button className="mb-4 flex w-full items-center justify-center rounded-full border border-gray-300 px-4 py-2">
					<GithubIcon className="mr-2" />
					Sign up with GitHub
				</button>

				<button className="flex w-full items-center justify-center rounded-full border border-gray-300 px-4 py-2">
					<GithubIcon className="mr-2" />
					Sign up with Google
				</button>
			</div>

			{/* Right side */}

			<div className="relative w-2/3 rounded-l-3xl bg-black p-12 text-white">
				<h2 className="mb-2 text-3xl font-bold">
					Reliable Automation
					<span className="text-xl font-normal">in Just a</span> Few Lines of Code
				</h2>

				<p className="mb-8 text-gray-400">Build automations in code in minutes</p>

				<h3 className="mb-4 text-xl">All you need to easily develop automations automations in Python code</h3>

				<ul className="mb-8 list-inside list-disc">
					<li>Serverless Python environment</li>

					<li>Super fast deploys</li>

					<li>Super fast ramp-up</li>

					<li>Builtin integrations</li>

					<li>Scalable</li>

					<li>Secured</li>

					<li>Observability</li>

					<li>Long-running workflow</li>

					<li>Ready to use Templates</li>
				</ul>

				{children}

				<img
					alt="autokitteh logo with integrations"
					className="absolute bottom-8 right-8 h-1/2"
					src={LoginIntegrationsLogoPng}
				/>
			</div>
		</div>
	);
};
