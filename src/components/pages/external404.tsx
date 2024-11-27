import React from "react";

import { Error404 } from "@assets/image";

export const External404 = () => {
	return (
		<div className="flex w-full flex-col items-center justify-center py-5">
			<Error404 className="w-1/3" />

			<div className="mt-16 font-fira-code text-lg text-black">Error: Page doesn&apos;t exist</div>
			<a className="mt-4 font-fira-code text-lg font-bold text-black" href="/">
				Go to Homepage
			</a>
		</div>
	);
};
