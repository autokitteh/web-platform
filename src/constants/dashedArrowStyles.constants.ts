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
				"@media (maxWidth: 640px)": {
					left: "-80px",
					top: "-70px",
					width: "70px",
					height: "90px",
				},
				"@media (minWidth: 641px) and (maxWidth: 768px)": {
					left: "-90px",
					top: "-75px",
					width: "80px",
					height: "100px",
				},
				"@media (minWidth: 769px) and (maxWidth: 1024px)": {
					left: "-100px",
					top: "-80px",
					width: "90px",
					height: "110px",
				},
				"@media (minWidth: 1025px) and (maxWidth: 1440px)": {
					left: "-110px",
					top: "-80px",
					width: "95px",
					height: "115px",
				},
				"@media (minWidth: 1441px) and (maxWidth: 1920px)": {
					left: "-120px",
					top: "-80px",
					width: "100px",
					height: "120px",
				},
				"@media (minWidth: 1921px)": {
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
				"@media (maxWidth: 640px)": {
					right: "-60px",
					top: "-70px",
					width: "60px",
					height: "80px",
					transform: "rotate(45deg) scaleX(-1)",
				},
				"@media (minWidth: 641px) and (maxWidth: 768px)": {
					right: "-80px",
					top: "-65px",
					width: "70px",
					height: "90px",
				},
				"@media (minWidth: 769px) and (maxWidth: 1024px)": {
					right: "-100px",
					top: "-65px",
					width: "75px",
					height: "95px",
				},
				"@media (minWidth: 1025px) and (maxWidth: 1440px)": {
					right: "-110px",
					top: "-60px",
					width: "80px",
					height: "100px",
				},
				"@media (minWidth: 1441px) and (maxWidth: 1920px)": {
					right: "-120px",
					top: "-60px",
					width: "80px",
					height: "100px",
				},
				"@media (minWidth: 1921px)": {
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
