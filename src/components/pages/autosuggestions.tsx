import React from "react";

import { motion, AnimatePresence } from "framer-motion";

/**
 * AutomationSuggestionsTabs
 * -------------------------------------------------------------
 * Tabbed suggestions area that groups templates by category.
 * Designed to accept data in the same shape as the provided templates.json.
 *
 * UX:
 *  - Sticky featured row that rotates among visible items
 *  - Category tabs with count badges
 *  - Per‑tab pagination: initial N items, Load more appends pageSize
 *  - Desktop grid + Mobile horizontal scroll (like the non-tab version)
 *  - Optional quick filter input (client-side)
 */

export type Template = {
	assetDirectory: string;
	category?: string;
	description?: string;
	integrations?: string[];
	title: string;
};

export type CategoryBlock = {
	name: string; // e.g., "DevOps"
	templates: Template[];
};

export const AutomationSuggestionsTabs: React.FC<{
	className?: string;
	data: CategoryBlock[]; // full data (e.g., from templates.json)
	initialCount?: number; // items shown per tab initially
	onSelect?: (t: Template) => void; // e.g., pipe into prompt
	pageSize?: number; // how many to add per load
}> = ({ data, initialCount = 8, pageSize = 4, onSelect, className }) => {
	const [activeIdx, setActiveIdx] = React.useState(0);
	const [query, setQuery] = React.useState("");

	// Per-tab shown counts
	const [shownCounts, setShownCounts] = React.useState(() =>
		data.map((cat) => Math.min(initialCount, cat.templates.length))
	);

	// Visible templates for the current tab with filtering
	const activeCat = data[activeIdx];
	const filtered = React.useMemo(() => {
		if (!query.trim()) return activeCat.templates;
		const q = query.toLowerCase();
		return activeCat.templates.filter(
			(t) =>
				t.title.toLowerCase().includes(q) ||
				(t.description?.toLowerCase().includes(q) ?? false) ||
				(t.integrations?.some((i) => i.toLowerCase().includes(q)) ?? false)
		);
	}, [activeCat, query]);

	const visible = React.useMemo(
		() => filtered.slice(0, shownCounts[activeIdx] ?? 0),
		[filtered, shownCounts, activeIdx]
	);

	// Featured rotator among visible
	const [featuredIndex, setFeaturedIndex] = React.useState(0);
	React.useEffect(() => {
		setFeaturedIndex(0); // reset on tab/filter change
	}, [activeIdx, query]);
	React.useEffect(() => {
		if (visible.length === 0) return;
		const id = setInterval(() => {
			setFeaturedIndex((i) => (i + 1) % visible.length);
		}, 5000);
		return () => clearInterval(id);
	}, [visible.length]);
	const featured = visible[featuredIndex];

	const loadMore = () =>
		setShownCounts((array) => array.map((c, i) => (i === activeIdx ? Math.min(c + pageSize, filtered.length) : c)));

	const canLoadMore = (shownCounts[activeIdx] ?? 0) < filtered.length;

	const handleSelect = (t: Template) => onSelect?.(t);

	return (
		<div className={"w-full space-y-4 " + (className ?? "")}>
			{/* Tabs */}
			<div className="-mx-2 flex items-center gap-2 overflow-x-auto px-2 pb-1">
				{data.map((cat, i) => {
					const isActive = i === activeIdx;
					return (
						<button
							className={`relative inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 transition-colors ${
								isActive
									? "border-white/20 bg-white/10 text-white"
									: "border-white/10 bg-white/5 text-white/70 hover:text-white"
							}`}
							key={cat.name}
							onClick={() => setActiveIdx(i)}
						>
							<span className="text-sm font-medium">{cat.name}</span>
							<span
								className={`rounded-md border px-1.5 py-0.5 text-[11px] ${
									isActive ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5"
								}`}
							>
								{cat.templates.length}
							</span>
						</button>
					);
				})}
			</div>

			{/* Quick filter */}
			<div className="flex items-center gap-2">
				<input
					className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/20"
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Filter by title, integrations, description…"
					value={query}
				/>
				{query ? (
					<button
						className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-white/70 hover:text-white"
						onClick={() => setQuery("")}
					>
						Clear
					</button>
				) : null}
			</div>

			{/* Featured */}
			<AnimatePresence mode="wait">
				{featured ? (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="text-sm text-white/80 md:text-base"
						exit={{ opacity: 0, y: -6 }}
						initial={{ opacity: 0, y: 6 }}
						key={(featured.assetDirectory || featured.title) + featuredIndex}
						transition={{ duration: 0.25 }}
					>
						<span className="mr-2">✨</span>
						<span className="font-medium">Try:</span>{" "}
						<button
							className="align-middle underline-offset-4 hover:underline focus:underline"
							onClick={() => handleSelect(featured)}
						>
							{featured.title}
						</button>
					</motion.div>
				) : null}
			</AnimatePresence>

			{/* Desktop grid */}
			<div className="hidden grid-cols-2 gap-2 md:grid lg:grid-cols-3 xl:grid-cols-4">
				{visible.map((t) => (
					<motion.button
						className="group rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left backdrop-blur-md hover:bg-white/10"
						key={t.assetDirectory || t.title}
						onClick={() => handleSelect(t)}
						whileHover={{ y: -1.5, scale: 1.01 }}
						whileTap={{ scale: 0.99 }}
					>
						<div className="flex items-start gap-2">
							<div aria-hidden className="mt-0.5 text-lg">
								⚙️
							</div>
							<div className="min-w-0">
								<div className="truncate text-[13px] font-medium text-white/90 md:text-[14px]">
									{t.title}
								</div>
								{t.description ? (
									<div className="truncate text-xs text-white/60">{t.description}</div>
								) : null}
								{t.integrations && t.integrations.length > 0 ? (
									<div className="mt-1 flex flex-wrap gap-1">
										{t.integrations.map((i) => (
											<span
												className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-10 text-white/60"
												key={i}
											>
												{i}
											</span>
										))}
									</div>
								) : null}
							</div>
						</div>
					</motion.button>
				))}
			</div>

			{/* Mobile carousel */}
			<div className="-mx-2 overflow-x-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden">
				<div className="flex snap-x snap-mandatory gap-2">
					{visible.map((t) => (
						<motion.button
							className="xs:w-[65%] w-[78%] shrink-0 snap-start rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left backdrop-blur-md hover:bg-white/10 sm:w-[55%]"
							key={t.assetDirectory || t.title}
							onClick={() => handleSelect(t)}
							whileTap={{ scale: 0.98 }}
						>
							<div className="truncate text-[13px] font-medium text-white/90">{t.title}</div>
							{t.description ? (
								<div className="truncate text-xs text-white/60">{t.description}</div>
							) : null}
						</motion.button>
					))}
				</div>
			</div>

			{/* Footer */}
			<div className="flex items-center gap-2 pt-1">
				{canLoadMore ? (
					<button
						className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10 md:text-sm"
						onClick={loadMore}
					>
						Load more
					</button>
				) : (
					<div className="text-xs text-white/50 md:text-sm">All {filtered.length} shown</div>
				)}
				<div className="ml-auto text-xs text-white/50">
					Showing {visible.length} of {filtered.length} in {activeCat.name}
				</div>
			</div>
		</div>
	);
};
