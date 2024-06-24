import React from "react";
import { Error404 } from "@assets/image";
import { Icon } from "@components/atoms";
import { Link } from "react-router-dom";

export const NotFound404: React.FC = () => (
	<div className="flex flex-col w-full h-full justify-center items-center">
		<div className="text-black mb-8 text-lg">Error: Page doesn&apos;t exist</div>
		<Icon className="w-1/3" src={Error404} />
		<Link className="text-black text-2xl mt-8" to="/">
			Back to Home
		</Link>
	</div>
);
