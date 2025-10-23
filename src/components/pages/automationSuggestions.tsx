import React from "react";

import { motion, AnimatePresence } from "framer-motion";

/**
 * AutomationSuggestions
 * -------------------------------------------------------------
 * A responsive, animated suggestions area that scales from 8–16 items.
 *
 * Features
 * - Featured rotating suggestion (changes every 5s)
 * - Desktop: 2-row responsive grid of pill-cards (up to 8 visible)
 * - Mobile: horizontal swipeable carousel with snap scrolling
 * - Shuffle button to surface a new random set from the master list
 * - Optional category tabs (commented out below if you want them later)
 * - onSelect callback to feed the prompt input
 *
 * Tailwind: relies on container having a dark background; adjust colors as needed.
 */

export type Suggestion = {
	category?: "Integrations" | "Monitoring" | "AI Agents" | "Other";
	description?: string;
	emoji?: string; // quick visual; replace with brand icons later
	id: string;
	title: string;
};

const MASTER_SUGGESTIONS: Suggestion[] = [
	{
		id: "uptime",
		title: "Website Uptime Monitor",
		emoji: "🖥️",
		description: "Ping site and alert on downtime",
		category: "Monitoring",
	},
	{
		id: "slack-bot",
		title: "Slack Chat Bot",
		emoji: "💬",
		description: "Respond to channel commands",
		category: "AI Agents",
	},
	{
		id: "notify-pr",
		title: "Notify PR in Slack",
		emoji: "🔔",
		description: "Post PR changes to #alerts",
		category: "Integrations",
	},
	{
		id: "email-ai",
		title: "Email reply with AI",
		emoji: "✉️",
		description: "Draft smart replies automatically",
		category: "AI Agents",
	},
	{
		id: "twilio-sms",
		title: "Webhook to SMS (Twilio)",
		emoji: "📲",
		description: "Send SMS when webhook fires",
		category: "Integrations",
	},
	{
		id: "reddit",
		title: "Reddit Post Tracker",
		emoji: "🧵",
		description: "Monitor subreddit posts",
		category: "Monitoring",
	},
	{
		id: "hn",
		title: "HackerNews Feed Monitor",
		emoji: "📰",
		description: "Track top HN stories",
		category: "Monitoring",
	},
	{
		id: "hubspot",
		title: "Send contacts from HubSpot",
		emoji: "📇",
		description: "Sync contacts to your app",
		category: "Integrations",
	},
	// Extra examples (to reach 12–16)
	{
		id: "health",
		title: "Service Health Alerts",
		emoji: "❤️",
		description: "Alert on latency & errors",
		category: "Monitoring",
	},
	{
		id: "release-notes",
		title: "Release Notes Agent",
		emoji: "📦",
		description: "Summarize changes into notes",
		category: "AI Agents",
	},
	{
		id: "gh-issues",
		title: "GitHub Issue Triage",
		emoji: "🗂️",
		description: "Auto-label & assign issues",
		category: "AI Agents",
	},
	{
		id: "calendar",
		title: "Calendar Digest",
		emoji: "📅",
		description: "Daily Slack agenda digest",
		category: "Integrations",
	},
	{
		id: "zendesk",
		title: "Zendesk Ticket Escalation",
		emoji: "🎫",
		description: "Escalate on negative sentiment",
		category: "AI Agents",
	},
	{
		id: "stripe",
		title: "Stripe Refund Notifier",
		emoji: "💳",
		description: "Alert on large refunds",
		category: "Integrations",
	},
	{ id: "rss", title: "RSS to Slack", emoji: "🔗", description: "Push new feed items", category: "Integrations" },
	{
		id: "seo",
		title: "SEO Change Watcher",
		emoji: "🔍",
		description: "Diff meta tags & sitemaps",
		category: "Monitoring",
	},
];

function sample<T>(arrayIn, n: number) {
	const copy = [...arrayIn];
	// Fisher–Yates shuffle (partial)
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy.slice(0, n);
}

export const AutomationSuggestions: React.FC<{
	allSuggestions?: Suggestion[]; // override master
	className?: string;
	onSelect?: (s: Suggestion) => void; // callback to populate input
	visibleCount?: number; // how many to show at once (desktop grid)
}> = ({ visibleCount = 8, onSelect, allSuggestions = MASTER_SUGGESTIONS, className }) => {
	const [pool] = React.useState<Suggestion[]>(() => allSuggestions);
	const [visible, setVisible] = React.useState<Suggestion[]>(() => sample(pool, visibleCount));
	const [featuredIndex, setFeaturedIndex] = React.useState(0);

	// Rotate featured suggestion every 5s
	React.useEffect(() => {
		const id = setInterval(() => {
			setFeaturedIndex((index) => (index + 1) % visible.length);
		}, 5000);
		return () => clearInterval(id);
	}, [visible.length]);

	const featured = visible[featuredIndex];

	const shuffle = () => setVisible(sample(pool, visibleCount));

	const handleSelect = (s: Suggestion) => {
		onSelect?.(s);
	};

	return (
		<div className={"w-full space-y-3 " + (className ?? "")}>
			{/* Featured blurb */}
			<AnimatePresence mode="wait">
				{featured ? (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className="text-sm text-white/80 md:text-base"
						exit={{ opacity: 0, y: -6 }}
						initial={{ opacity: 0, y: 6 }}
						key={featured.id + featuredIndex}
						transition={{ duration: 0.25 }}
					>
						<span className="mr-2">✨</span>
						<span className="font-medium">Try:</span>{" "}
						<button
							aria-label={`Use ${featured.title}`}
							className="align-middle underline-offset-4 hover:underline focus:underline"
							onClick={() => handleSelect(featured)}
						>
							{featured.title}
						</button>
					</motion.div>
				) : null}
			</AnimatePresence>

			{/* Desktop grid (≥ md) */}
			<div className="hidden grid-cols-2 gap-2 md:grid lg:grid-cols-4">
				{visible.map((s) => (
					<motion.button
						className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left backdrop-blur-md hover:bg-white/10"
						key={s.id}
						onClick={() => handleSelect(s)}
						whileHover={{ y: -1.5, scale: 1.01 }}
						whileTap={{ scale: 0.99 }}
					>
						<span aria-hidden className="select-none text-base md:text-lg">
							{s.emoji ?? "⚙️"}
						</span>
						<div className="min-w-0">
							<div className="truncate text-[13px] font-medium text-white/90 md:text-[14px]">
								{s.title}
							</div>
							{s.description ? (
								<div className="truncate text-xs text-white/60">{s.description}</div>
							) : null}
						</div>
					</motion.button>
				))}
			</div>

			{/* Mobile carousel (< md) */}
			<div className="-mx-2 overflow-x-auto px-2 [-ms-overflow-style:none] [scrollbar-width:none] md:hidden">
				<div className="flex snap-x snap-mandatory gap-2">
					{visible.map((s) => (
						<motion.button
							className="xs:w-[65%] inline-flex w-[78%] shrink-0 snap-start items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md hover:bg-white/10 sm:w-[55%]"
							key={s.id}
							onClick={() => handleSelect(s)}
							whileTap={{ scale: 0.98 }}
						>
							<span aria-hidden className="select-none text-base">
								{s.emoji ?? "⚙️"}
							</span>
							<div className="min-w-0">
								<div className="truncate text-[13px] font-medium text-white/90">{s.title}</div>
								{s.description ? (
									<div className="truncate text-xs text-white/60">{s.description}</div>
								) : null}
							</div>
						</motion.button>
					))}
				</div>
			</div>
		</div>
	);
};

export default AutomationSuggestions;
