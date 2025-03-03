/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Button, IconSvg, Typography } from "@components/atoms";
import { IntegrationsCarousel } from "@components/organisms/carousel";

import { InJustA, AKRoundLogo, ProjectsIcon } from "@assets/image";
import { FinishIcon, StartTemplateIcon } from "@assets/image/icons";
import CEOImage from "@assets/image/intro/haim.jpeg";

export const WelcomePage111 = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const navigate = useNavigate();

	return (
		<div className="flex min-h-screen flex-col justify-items-end overflow-y-auto bg-gradient-to-b from-gray-1250 to-gray-1100">
			{/* Header with logo */}
			<header className="flex items-center justify-between border-b border-gray-900 p-6">
				<div className="flex items-center">
					<IconSvg className="size-10" src={AKRoundLogo} />
					<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
						{t("welcome.title", "Welcome to AutoKitteh")}
					</Typography>
				</div>
				<Button className="text-sm text-green-800" onClick={() => navigate("/dashboard")} variant="light">
					Skip Intro
				</Button>
			</header>

			{/* Main content */}
			<main className="flex grow flex-col items-center justify-between px-6 py-8 md:px-16">
				<div className="mb-8 h-24 w-full max-w-6xl">
					<div className="relative h-12">
						<div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-gray-900 to-green-800" />
						<div className="relative z-10 flex justify-between">
							{["Create", "Deploy", "Connect", "Launch"].map((step, i) => (
								<div className="flex flex-col items-center" key={i}>
									<div
										className={`flex size-12 items-center justify-center rounded-full font-bold ${i === 0 ? "bg-green-800 text-gray-1250" : "bg-gray-900"}`}
									>
										{i === 0 ? "✓" : i + 1}
									</div>
									<p className="mt-2 text-white">{step}</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Welcome message */}
				<div className="max-w-3xl text-center">
					<Typography className="mb-4 text-3xl font-bold text-white md:text-4xl" element="h2">
						{t("welcome.headline", "Build Reliable Automation")}
					</Typography>
					<Typography className="mb-6 text-xl font-bold text-green-800 md:text-2xl" element="h3">
						<InJustA className="mr-2 inline-block" /> {t("welcome.subheadline", "in a few lines of code")}
					</Typography>
				</div>
				<div className="mb-12 w-full max-w-6xl rounded-xl border border-gray-900 bg-gray-1000/30 p-6">
					<Typography className="mb-4 text-xl font-bold text-white" element="h3">
						{t("welcome.whatBringsYou", "What are you looking to automate today?")}
					</Typography>

					<div className="relative">
						<input
							className="w-full rounded-lg border-none bg-gray-900 px-4 py-3 text-white focus:ring-2 focus:ring-green-800"
							placeholder="e.g., I want to connect my Slack notifications to my team calendar"
							type="text"
						/>
						<Button className="absolute right-2 top-2 rounded-lg bg-green-800 px-4 py-1 text-gray-1400">
							{t("welcome.analyze", "Analyze")}
						</Button>
					</div>

					<div className="mt-4 flex flex-wrap gap-2">
						<Button
							className="rounded-full border border-gray-800 px-3 py-1 text-sm text-gray-300"
							variant="outline"
						>
							Slack integration
						</Button>
						<Button
							className="rounded-full border border-gray-800 px-3 py-1 text-sm text-gray-300"
							variant="outline"
						>
							Calendar automation
						</Button>
						<Button
							className="rounded-full border border-gray-800 px-3 py-1 text-sm text-gray-300"
							variant="outline"
						>
							Notifications
						</Button>
					</div>
				</div>
				<div className="mb-12 w-full max-w-6xl">
					<Typography className="mb-6 text-xl font-bold text-white" element="h3">
						{t("welcome.popularUses", "Popular ways to use AutoKitteh")}
					</Typography>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{[
							{ title: "DevOps Alerts", icon: "🔔", color: "from-blue-900/20 to-blue-800/5" },
							{ title: "Marketing Workflows", icon: "📈", color: "from-purple-900/20 to-purple-800/5" },
							{ title: "Customer Support", icon: "🛟", color: "from-red-900/20 to-red-800/5" },
						].map((category) => (
							<div
								className={`rounded-xl border border-gray-900 bg-gradient-to-br p-6 ${category.color} cursor-pointer transition-transform hover:scale-105`}
								key={category.title}
							>
								<div className="mb-3 text-3xl">{category.icon}</div>
								<Typography className="text-lg font-bold text-white" element="h4">
									{category.title}
								</Typography>
								<Typography className="text-sm text-gray-300" element="p">
									{t("welcome.exploreCategory", "Explore templates & examples")}
								</Typography>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
};

export const WelcomePage222 = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const navigate = useNavigate();

	return (
		<div className="flex min-h-screen flex-col justify-items-end overflow-y-auto bg-gradient-to-b from-gray-1250 to-gray-1100">
			{/* Header with logo */}
			<header className="flex items-center justify-between border-b border-gray-900 p-6">
				<div className="flex items-center">
					<IconSvg className="size-10" src={AKRoundLogo} />
					<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
						{t("welcome.title", "Welcome to AutoKitteh")}
					</Typography>
				</div>
				<Button className="text-sm text-green-800" onClick={() => navigate("/dashboard")} variant="light">
					Skip Intro
				</Button>
			</header>

			{/* Main content */}
			<main className="flex grow flex-col items-center justify-between px-6 py-8 md:px-16">
				<div className="mb-8 h-24 w-full max-w-6xl">
					<div className="relative h-12">
						<div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-gradient-to-r from-gray-900 to-green-800" />
						<div className="relative z-10 flex justify-between">
							{["Create", "Deploy", "Connect", "Launch"].map((step, i) => (
								<div className="flex flex-col items-center" key={i}>
									<div
										className={`flex size-12 items-center justify-center rounded-full font-bold ${i === 0 ? "bg-green-800 text-gray-1250" : "bg-gray-900"}`}
									>
										{i === 0 ? "✓" : i + 1}
									</div>
									<p className="mt-2 text-white">{step}</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Welcome message */}
				<div className="max-w-3xl text-center">
					<Typography className="mb-4 text-3xl font-bold text-white md:text-4xl" element="h2">
						{t("welcome.headline", "Build Reliable Automation")}
					</Typography>
					<Typography className="mb-6 text-xl font-bold text-green-800 md:text-2xl" element="h3">
						<InJustA className="mr-2 inline-block" /> {t("welcome.subheadline", "in a few lines of code")}
					</Typography>
				</div>
				<div className="mb-12 w-full max-w-6xl rounded-xl border-2 border-dashed border-green-800/30 bg-gray-1000/30 p-6">
					<Typography className="mb-2 text-center text-xl font-bold text-white" element="h3">
						{t("welcome.tryItOut", "Try it out now - no account needed")}
					</Typography>

					<Typography className="mb-6 text-center text-gray-300" element="p">
						{t("welcome.demoDescription", "Connect these blocks to see AutoKitteh in action")}
					</Typography>

					<div className="flex h-[150px] items-center justify-center gap-4">
						<div className="flex h-full flex-col items-center rounded-lg bg-gray-900 p-4  text-white">
							<div className="mb-2 text-2xl">📱</div>
							<p>Notification</p>
							<div className="mt-4 flex size-8 items-center justify-center rounded-full bg-green-800 text-gray-1250">
								→
							</div>
						</div>

						<div className="h-px w-16 animate-pulse bg-gray-700" />

						<div className="flex h-full flex-col items-center rounded-lg bg-gray-900 p-4 text-white opacity-50">
							<div className="mb-2 text-2xl">📋</div>
							<p>Process</p>
							<div className="mt-4 flex size-8 items-center justify-center rounded-full bg-gray-800">
								→
							</div>
						</div>

						<div className="h-px w-16 bg-gray-700 opacity-30" />

						<div className="flex h-full flex-col items-center rounded-lg bg-gray-900 p-4 text-white opacity-30">
							<div className="mb-2 text-2xl">💬</div>
							<p>Slack Message</p>
							<div className="mt-4 flex size-8 items-center justify-center rounded-full bg-green-800 text-gray-1250">
								<IconSvg className="size-4 fill-black" src={FinishIcon} />
							</div>
						</div>
					</div>

					<div className="mt-6 flex w-full justify-center">
						<Button className="rounded-lg bg-green-800 px-8 py-2">
							{t("welcome.connectBlocks", "Connect these blocks")}
						</Button>
					</div>
				</div>
				<div className="mb-12 w-full max-w-6xl">
					<Typography className="mb-6 text-xl font-bold text-white" element="h3">
						{t("welcome.popularUses", "Popular ways to use AutoKitteh")}
					</Typography>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						{[
							{ title: "DevOps Alerts", icon: "🔔", color: "from-blue-900/20 to-blue-800/5" },
							{ title: "Marketing Workflows", icon: "📈", color: "from-purple-900/20 to-purple-800/5" },
							{ title: "Customer Support", icon: "🛟", color: "from-red-900/20 to-red-800/5" },
						].map((category) => (
							<div
								className={`rounded-xl border border-gray-900 bg-gradient-to-br p-6 ${category.color} cursor-pointer transition-transform hover:scale-105`}
								key={category.title}
							>
								<div className="mb-3 text-3xl">{category.icon}</div>
								<Typography className="text-lg font-bold text-white" element="h4">
									{category.title}
								</Typography>
								<Typography className="text-sm text-gray-300" element="p">
									{t("welcome.exploreCategory", "Explore templates & examples")}
								</Typography>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
};

export const WelcomePage4 = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const navigate = useNavigate();

	const handleCreateNewProject = () => {
		// Logic for creating a new blank project
		navigate("/editor/new");
	};

	const handleBrowseTemplates = () => {
		// Navigate to templates library
		navigate("/templates");
	};

	return (
		<div className="flex min-h-screen flex-col justify-items-end overflow-y-auto bg-gradient-to-b from-gray-1250 to-gray-1100">
			{/* Header with logo */}
			<header className="flex items-center justify-between border-b border-gray-900 p-6">
				<div className="flex items-center">
					<IconSvg className="size-10" src={AKRoundLogo} />
					<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
						{t("welcome.title", "Welcome to AutoKitteh")}
					</Typography>
				</div>
				<Button className="text-sm text-green-800" onClick={() => navigate("/dashboard")} variant="light">
					Skip Intro
				</Button>
			</header>

			{/* Main content */}
			<main className="flex grow flex-col items-center justify-between px-6 py-8 md:px-16">
				{/* Welcome message */}
				<div className="mb-6 max-w-3xl text-center">
					<Typography className="mb-4 text-3xl font-bold text-white md:text-4xl" element="h2">
						{t("welcome.headline", "Build Reliable Automation")}
					</Typography>
					<Typography className="mb-6 text-xl font-bold text-green-800 md:text-2xl" element="h3">
						<InJustA className="mr-2 inline-block" /> {t("welcome.subheadline", "in a few lines of code")}
					</Typography>
				</div>

				{/* Two columns: New Project vs Templates */}
				<div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
					{/* Start from scratch column */}
					<div className="flex flex-col items-center rounded-2xl border-2 border-gray-900 bg-gray-1000/20 p-8 transition-colors hover:border-green-800/60">
						<div className="mb-6 rounded-full bg-gray-900 p-6">
							<IconSvg className="size-12" src={ProjectsIcon} />
						</div>
						<Typography className="mb-4 text-2xl font-bold text-white" element="h3">
							{t("welcome.newProject", "Start from scratch")}
						</Typography>
						<Typography className="mb-8 text-center text-gray-300" element="p">
							{t(
								"welcome.newProjectDesc",
								"Begin with a blank canvas and build your automation exactly how you want it. Perfect for experienced users or specific custom needs."
							)}
						</Typography>
						<Button
							className="w-full justify-center rounded-lg bg-gray-900 py-3 text-white hover:bg-gray-800"
							onClick={handleCreateNewProject}
						>
							{t("welcome.createNew", "Create New Project")}
						</Button>
					</div>

					{/* Templates column */}
					<div className="flex flex-col items-center rounded-2xl border-2 border-green-800/40 bg-gray-1000/20 p-8 transition-colors hover:border-green-800">
						<div className="mb-6 rounded-full bg-green-800/20 p-6">
							<IconSvg className="size-12" src={StartTemplateIcon} />
						</div>
						<Typography className="mb-4 text-2xl font-bold text-white" element="h3">
							{t("welcome.useTemplate", "Start from template")}
						</Typography>
						<Typography className="mb-2 text-center text-gray-300" element="p">
							{t(
								"welcome.useTemplateDesc",
								"Choose from our collection of ready-made templates for common workflows and integrations. The fastest way to get started."
							)}
						</Typography>
						<Button
							className="mt-6 w-full justify-center rounded-lg bg-green-800 py-3"
							onClick={handleBrowseTemplates}
						>
							{t("welcome.browseTemplates", "Browse Templates")}
						</Button>
					</div>
				</div>

				{/* CEO Message or testimonials (optional) */}
				<div className="mt-16 max-w-3xl rounded-xl border border-gray-900 bg-gray-1100/50 p-6">
					<Typography className="mb-3 text-xl font-bold text-white" element="h3">
						{t("welcome.ceoMessage", "A message from our team")}
					</Typography>
					<Typography className="italic text-gray-300" element="p">
						&quot;
						{t(
							"welcome.ceoQuote",
							"We built AutoKitteh to make automation accessible, reliable and powerful. Our goal is to help you connect your tools and workflows with minimal effort and maximum impact."
						)}
						&quot;
					</Typography>
					<div className="mt-4 flex ">
						<img alt="CEO HAIM" className="mr-3 size-12 rounded-full" src={CEOImage} />
						<div className="flex flex-col justify-between">
							<Typography className="mb-0.5 font-medium text-white" element="span">
								Haim Zlatokrilov
							</Typography>
							<Typography className="text-sm text-gray-400" element="p">
								Co-Founder & CEO, AutoKitteh
							</Typography>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export const WelcomePage5 = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const navigate = useNavigate();
	return (
		<div className="flex min-h-screen flex-col justify-items-end overflow-y-auto bg-gradient-to-b from-gray-1250 to-gray-1100">
			{/* Header with logo */}
			<header className="flex items-center justify-between border-b border-gray-900 p-6">
				<div className="flex items-center">
					<IconSvg className="size-10" src={AKRoundLogo} />
					<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
						{t("welcome.title", "Welcome to AutoKitteh")}
					</Typography>
				</div>
				<Button className="text-sm text-green-800" onClick={() => navigate("/dashboard")} variant="light">
					Skip Intro
				</Button>
			</header>

			{/* Main content */}
			<main className="flex grow flex-col items-center justify-between px-6 py-8 md:px-16">
				{/* Welcome message */}
				<div className="mb-6 max-w-3xl text-center">
					<Typography className="mb-4 text-3xl font-bold text-white md:text-4xl" element="h2">
						{t("welcome.headline", "Build Reliable Automation")}
					</Typography>
					<Typography className="mb-6 text-xl font-bold text-green-800 md:text-2xl" element="h3">
						<InJustA className="mr-2 inline-block" /> {t("welcome.subheadline", "in a few lines of code")}
					</Typography>
				</div>

				<div className="mb-12 w-full max-w-6xl rounded-xl border border-gray-900 bg-gray-1000/30 p-6">
					<Typography className="mb-4 text-xl font-bold text-white" element="h3">
						{t("welcome.tailorExperience", "Tailor your experience")}
					</Typography>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<Button className="flex flex-col rounded-lg border border-gray-800 p-4 text-left transition-all hover:border-green-800 hover:bg-gray-900/30">
							<div className="mb-1 text-lg font-medium text-white">🧑‍💻 I&apos;m a Developer</div>
							<p className="text-sm text-gray-300">API access, custom code & webhooks</p>
						</Button>

						<Button className="flex flex-col rounded-lg border border-gray-800 p-4 text-left transition-all hover:border-green-800 hover:bg-gray-900/30">
							<div className="mb-1 text-lg font-medium text-white">🧑‍💼 I&apos;m in Business</div>
							<p className="text-sm text-gray-300">Workflows, integrations & no-code</p>
						</Button>

						<Button className="flex flex-col rounded-lg border border-gray-800 p-4 text-left transition-all hover:border-green-800 hover:bg-gray-900/30">
							<div className="mb-1 text-lg font-medium text-white">🔎 Just Exploring</div>
							<p className="text-sm text-gray-300">Show me everything AutoKitteh offers</p>
						</Button>
					</div>
				</div>
				<div className="mb-12 w-full max-w-6xl">
					<Typography className="mb-4 text-xl font-bold text-white" element="h3">
						{t("welcome.firstMilestones", "Your path to automation success")}
					</Typography>

					<div className="space-y-4">
						{[
							{ step: 1, title: "Create your first project", time: "2 min", completed: true },
							{ step: 2, title: "Connect your first integration", time: "3 min", completed: false },
							{ step: 3, title: "Set up your first automation", time: "5 min", completed: false },
							{ step: 4, title: "Celebrate automation success", time: "∞", completed: false },
						].map((milestone, i) => (
							<div
								className={`flex items-center rounded-lg border p-4 ${milestone.completed ? "border-green-800 bg-green-800/10" : "border-gray-900 bg-gray-1000/30"}`}
								key={i}
							>
								<div
									className={`mr-4 flex size-8 items-center justify-center rounded-full ${milestone.completed ? "bg-green-800 text-gray-1250" : "bg-gray-1250"}`}
								>
									{milestone.completed ? "✓" : milestone.step}
								</div>
								<div className="grow">
									<Typography
										className={`font-medium ${milestone.completed ? "text-green-800" : "text-white"}`}
										element="p"
									>
										{milestone.title}
									</Typography>
								</div>
								<div className="text-sm text-gray-400">{milestone.time}</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
};

export const WelcomePage = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "welcome" });
	const navigate = useNavigate();
	return (
		<div className="flex min-h-screen flex-col justify-items-end overflow-y-auto bg-gradient-to-b from-gray-1250 to-gray-1100">
			{/* Header with logo */}
			<header className="flex items-center justify-between border-b border-gray-900 p-6">
				<div className="flex items-center">
					<IconSvg className="size-10" src={AKRoundLogo} />
					<Typography className="ml-3 text-2xl font-bold text-white" element="h1">
						{t("welcome.title", "Welcome to AutoKitteh")}
					</Typography>
				</div>
				<Button className="text-sm text-green-800" onClick={() => navigate("/dashboard")} variant="light">
					Skip Intro
				</Button>
			</header>

			{/* Main content */}
			<main className="flex grow flex-col items-center justify-between px-6 py-8 md:px-16">
				{/* Welcome message */}
				<div className="mb-6 max-w-3xl text-center">
					<Typography className="mb-4 text-3xl font-bold text-white md:text-4xl" element="h2">
						{t("welcome.headline", "Build Reliable Automation")}
					</Typography>
					<Typography className="mb-6 text-xl font-bold text-green-800 md:text-2xl" element="h3">
						<InJustA className="mr-2 inline-block" /> {t("welcome.subheadline", "in a few lines of code")}
					</Typography>
				</div>

				<div className="mb-12 w-full max-w-6xl rounded-xl border border-gray-900 bg-gray-1000/30 p-6">
					<div className="mb-6 flex items-center justify-between">
						<Typography className="text-xl font-bold text-white" element="h3">
							{t("welcome.perfectMatch", "Finding your perfect template match")}
						</Typography>

						<div className="flex items-center space-x-2">
							<span className="text-sm text-gray-400">Powered by</span>
							<span className="rounded bg-green-800/20 px-2 py-1 text-xs text-white">AutoKitteh AI</span>
						</div>
					</div>

					<div className="mb-6 space-y-4">
						<div>
							<label className="mb-2 block text-sm text-gray-300">What tools do you currently use?</label>
							<div className="flex flex-wrap gap-2">
								{["Slack", "GitHub", "Jira", "Google Calendar", "Salesforce", "Notion", "+"].map(
									(tool) => (
										<Button
											className="rounded-md border border-gray-800 px-3 py-1 text-sm text-white hover:border-green-800"
											key={tool}
										>
											{tool}
										</Button>
									)
								)}
							</div>
						</div>

						<div>
							<label className="mb-2 block text-sm text-gray-300">
								What are your top automation priorities?
							</label>
							<div className="flex flex-wrap gap-2">
								{[
									"Save time",
									"Reduce errors",
									"Better visibility",
									"Team coordination",
									"Customer experience",
									"+",
								].map((priority) => (
									<Button
										className="rounded-md border border-gray-800 px-3 py-1 text-sm text-white hover:border-green-800"
										key={priority}
									>
										{priority}
									</Button>
								))}
							</div>
						</div>
					</div>

					<Button className="w-full rounded-lg bg-gradient-to-r from-green-800 to-green-500 py-3 pl-3 font-medium text-black">
						{t("welcome.findTemplates", "Find my ideal templates")}
					</Button>
				</div>
				<IntegrationsCarousel />
			</main>
		</div>
	);
};
