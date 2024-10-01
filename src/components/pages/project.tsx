import React, { useMemo } from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { defaultProjectTab, projectTabs } from "@constants/project.constants";
import { useProjectValidationStore } from "@src/store";
import { calculatePathDepth } from "@utilities";

import { IconSvg, Tab } from "@components/atoms";
import { SplitFrame } from "@components/organisms";

import { WarningTriangleIcon } from "@assets/image/icons";

export const Project = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { projectValidationState } = useProjectValidationStore();

	const activeTab = useMemo(() => {
		const pathParts = location.pathname.split("/").filter(Boolean);

		return pathParts[2] || defaultProjectTab;
	}, [location.pathname]);

	const displayTabs = useMemo(() => calculatePathDepth(location.pathname) < 4, [location.pathname]);

	const goTo = (path: string) => {
		navigate(path.toLowerCase());
	};

	return (
		<SplitFrame>
			{displayTabs ? (
				<div className="flex h-full flex-1 flex-col">
					<div className="sticky -top-8 z-20 -mt-5 bg-gray-1100 pb-0 pt-3">
						<div className="xl:gap-2 scrollbar flex shrink-0 select-none items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap py-2 pb-5 2xl:gap-4 3xl:gap-5">
							{projectTabs.map((tabKey) => {
								const tabState =
									projectValidationState[tabKey.value as keyof typeof projectValidationState];
								const warning = tabState.level === "warning" ? tabState.message : "";
								const error = tabState.level === "error" ? tabState.message : "";

								return (
									<Tab
										activeTab={activeTab}
										ariaLabel={tabState?.message || tabKey.label}
										key={tabKey.value}
										onClick={() => goTo(tabKey.value)}
										title={tabState?.message || tabKey.label}
										value={tabKey.value}
									>
										<div className="flex items-center">
											<div className="tracking-wide">{tabKey.label}</div>

											{error ? (
												<div className="mb-0.5 ml-1.5 size-3 rounded-full bg-error" />
											) : null}

											{warning ? (
												<div className="relative mb-1.5 ml-1.5 size-3 rounded-full">
													<IconSvg src={WarningTriangleIcon} />
												</div>
											) : null}
										</div>
									</Tab>
								);
							})}
						</div>
					</div>

					<div className="h-full">
						<Outlet />
					</div>
				</div>
			) : (
				<Outlet />
			)}
		</SplitFrame>
	);
};
