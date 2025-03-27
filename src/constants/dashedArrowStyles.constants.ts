import { CSSProperties } from "react";

import { ArrowStyleConfig } from "@interfaces/components";

export const getArrowStyles = (direction: "topLeft" | "topRight", color = "#BCF870"): CSSProperties => {
	const configs: Record<string, ArrowStyleConfig> = {
		topLeft: {
			base: {
				"--c": color,
				"--r": "7px",
				"--s": "7px",
				position: "absolute",
				left: "-120px",
				top: "-80px",
				width: "100px",
				height: "120px",
				transform: "rotate(90deg) scaleX(-1) scaleY(-1)",
			},
			responsive: {
				"@media (max-width: 640px)": {
					left: "-80px",
					top: "-70px",
					width: "70px",
					height: "90px",
				},
				"@media (min-width: 641px) and (max-width: 768px)": {
					left: "-90px",
					top: "-75px",
					width: "80px",
					height: "100px",
				},
				"@media (min-width: 769px) and (max-width: 1024px)": {
					left: "-100px",
					top: "-80px",
					width: "90px",
					height: "110px",
				},
				"@media (min-width: 1025px) and (max-width: 1440px)": {
					left: "-110px",
					top: "-80px",
					width: "95px",
					height: "115px",
				},
				"@media (min-width: 1441px) and (max-width: 1920px)": {
					left: "-120px",
					top: "-80px",
					width: "100px",
					height: "120px",
				},
				"@media (min-width: 1921px)": {
					left: "-140px",
					top: "-90px",
					width: "110px",
					height: "130px",
				},
			},
		},
		topRight: {
			base: {
				"--c": color,
				"--r": "7px",
				"--s": "7px",
				position: "absolute",
				top: "-60px",
				right: "-120px",
				width: "80px",
				height: "100px",
				transform: "rotate(90deg) scaleX(-1)",
			},
			responsive: {
				"@media (max-width: 640px)": {
					right: "-60px",
					top: "-70px",
					width: "60px",
					height: "80px",
					transform: "rotate(45deg) scaleX(-1)",
				},
				"@media (min-width: 641px) and (max-width: 768px)": {
					right: "-80px",
					top: "-65px",
					width: "70px",
					height: "90px",
				},
				"@media (min-width: 769px) and (max-width: 1024px)": {
					right: "-100px",
					top: "-65px",
					width: "75px",
					height: "95px",
				},
				"@media (min-width: 1025px) and (max-width: 1440px)": {
					right: "-110px",
					top: "-60px",
					width: "80px",
					height: "100px",
				},
				"@media (min-width: 1441px) and (max-width: 1920px)": {
					right: "-120px",
					top: "-60px",
					width: "80px",
					height: "100px",
				},
				"@media (min-width: 1921px)": {
					right: "-140px",
					top: "-60px",
					width: "90px",
					height: "110px",
				},
			},
		},
	};

	const config = configs[direction];
	return { ...config.base, ...config.responsive } as CSSProperties;
};
