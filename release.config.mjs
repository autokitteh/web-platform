/* eslint-disable no-undef */
/**
 * @type {import('semantic-release').GlobalConfig}
 */

export default {
	branches: ["main"],
	plugins: [
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "conventionalcommits",
			},
		],
		[
			"@semantic-release/github",
			{
				assets: ["dist/**"],
			},
		],
		[
			"@semantic-release/changelog",
			{
				changelogFile: "CHANGELOG.md",
			},
		],
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
				message: "chore(release): ${nextRelease.version} \n\n${nextRelease.notes}",
			},
		],
		[
			"semantic-release-slack-bot",
			{
				notifyOnSuccess: false,
				notifyOnFail: false,
				slackWebhook: process.env.SLACK_WEBHOOK_URL,
				onSuccessTemplate: {
					text:
						":announcement: *Meow-velous News, Team!* :announcement: \n" +
						"Version *$npm_package_version* has just landed on our digital doorstep, " +
						"and it's purr-fectly packed with features!\n\n \n\n" +
						":yasss_cat: What's New:\n" +
						"$release_notes	\n\n" +
						"Let's make some paw-some progress!\n\n" +
						"*Happy Coding, Furr-iends!* " +
						":cat-roomba-exceptionally-fast: " +
						"*Stay Pawsome!*\n :catjam: _Your Dev Team_ :catjam:",
				},
				onFailTemplate: {
					text:
						":red_circle: *Attention Team: Paws for Thought!* :paw_prints:\n" +
						"Our latest version *$npm_package_version* has encountered a hiccup," +
						" and it's not as purr-fect as we hoped.\n\n" +
						":toolbox: *What We're Doing:*\n- Assembling our team of " +
						"Cat Coders to hunt down those pesky bugs. Link to our rrrrrrepo: $repo_url \n" +
						"- Refining the 'cat-nip' module to ensure it's not too overwhelming.\n\n" +
						"*Thank You for Your Patience!* " +
						"We're working hard to make things right and appreciate your support.\n\n" +
						" :sob_cat: *Stay Tuned for Updates!*\n :catjam: _Your Dev Team_ :catjam:",
				},
				branchesConfig: [
					{
						pattern: "main",
						notifyOnSuccess: true,
						notifyOnFail: true,
					},
				],
			},
		],
	],
};
