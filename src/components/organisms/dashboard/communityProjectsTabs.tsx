import React, { useCallback, useMemo, useState } from "react";

import { communityProjectCategories, defaultCommunityProjectCategory } from "@constants";

import { Tab } from "@components/atoms";
import { CommunityProjectCard } from "@components/organisms/dashboard";

export const CommunityProjectsTabs = () => {
	const [activeTab, setActiveTab] = useState<string>(defaultCommunityProjectCategory);

	const activeCategory = useMemo(
		() => communityProjectCategories.find((category) => category.name === activeTab),
		[activeTab]
	);

	const handleTabClick = useCallback((category: string) => {
		setActiveTab(category);
	}, []);

	return (
		<div className="flex h-full flex-1 flex-col">
			<div className="sticky -top-8 z-20 -mt-5 bg-gray-100 pb-0 pt-3">
				<div
					className={
						"flex select-none items-center gap-2 xl:gap-4 2xl:gap-5 3xl:gap-6 " +
						"scrollbar shrink-0 overflow-x-auto overflow-y-hidden whitespace-nowrap py-2"
					}
				>
					{communityProjectCategories.map(({ name }) => (
						<Tab
							activeTab={activeTab}
							ariaLabel={name}
							className="border-b-4 pb-0 text-lg normal-case"
							key={name}
							onClick={() => handleTabClick(name)}
							value={name}
							variant="dark"
						>
							{name}
						</Tab>
					))}
				</div>
			</div>

			<div className="mt-4 grid grid-cols-auto-fit-305 gap-x-4 gap-y-5 text-black">
				{activeCategory
					? activeCategory.cards.map((card, index) => (
							<CommunityProjectCard card={card} category={activeCategory.name} key={index} />
						))
					: null}
			</div>
		</div>
	);
};
