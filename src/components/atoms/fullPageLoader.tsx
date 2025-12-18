import React from "react";

import { Loader } from "@components/atoms/loader";

export const FullPageLoader = () => (
	<div className="flex h-screen w-full items-center justify-center">
		<Loader size="xl" />
	</div>
);
