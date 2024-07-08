import React, { useEffect, useRef } from "react";

import { Map } from "@assets/image";

export const MapMenu = () => {
	const refMapRef = useRef<SVGSVGElement | null>(null);

	useEffect(() => {
		const map = refMapRef.current;
		const pathIds = ["connections", "triggers", "variables", "code-assets"];

		const handleClick = ({ target }: { target: EventTarget | null }) => {
			if (!(target instanceof SVGElement)) {
				return;
			}

			if (pathIds.includes(target.id)) {
				pathIds.forEach((id) => {
					const path = map?.querySelector(`#${id}`);
					path?.classList.remove("active");
					path?.setAttribute("fill", "#D2D2D7");
				});
				target.classList.add("active");
				target.setAttribute("fill", "#1B1B1B");
			}
		};

		map?.addEventListener("click", handleClick);

		return () => map?.removeEventListener("click", handleClick);
	}, [refMapRef]);

	return <Map className="w-full" ref={refMapRef} />;
};
