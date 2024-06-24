import React from "react";
import { Error404 } from "@assets/image";
import { Icon } from "@components/atoms";
import { Link } from "react-router-dom";

export const NotFound404: React.FC = () => (
	<div className="flex flex-col w-full h-full justify-center items-center">
		<Icon className="w-1/3" src={Error404} />
		<div className="text-black mt-16 text-lg font-fira-code">Error: Page doesn&apos;t exist</div>
		<Link className="text-black text-lg mt-4 font-fira-code font-bold" to="/">
			Back to Home
		</Link>
	</div>
);
