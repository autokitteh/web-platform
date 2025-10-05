/* eslint-disable no-undef */
/**
 * @type {import('semantic-release').GlobalConfig}
 */

export default {
	branches: ["main"],
	plugins: [
		[
			"@semantic-release/commit-analyzer",
			{
				preset: "conventionalcommits",
				parserOpts: {
					noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"],
				},
				releaseRules: [
					// Breaking changes - any commit type with ! suffix
					{ breaking: true, release: "major" },

					// Feature additions (minor version)
					{ type: "feat", release: "minor" },

					// Bug fixes and patches
					{ type: "fix", release: "patch" },
					{ type: "perf", release: "patch" },
					{ type: "revert", release: "patch" },

					// Minor improvements and maintenance
					{ type: "refactor", release: "patch" },
					{ type: "chore", release: "patch" },

					// No release for these types
					{ type: "ci", release: false },
					{ type: "docs", release: false },
					{ type: "test", release: false },
				],
			},
		],
		[
			"@semantic-release/release-notes-generator",
			{
				preset: "conventionalcommits",
				presetConfig: {
					types: [
						{ type: "feat", section: "Features" },
						{ type: "fix", section: "Bug Fixes" },
						{ type: "perf", section: "Performance" },
						{ type: "refactor", section: "Refactors" },
						{ type: "revert", section: "Reverts" },
						{ type: "chore", section: "Maintenance" },
						{ type: "docs", section: "Documentation", hidden: true },
						{ type: "test", section: "Tests", hidden: true },
						{ type: "ci", section: "CI/CD", hidden: true },
					],
				},
				writerOpts: {
					commitsSort: ["subject", "scope"],
				},
			},
		],
		[
			"@semantic-release/changelog",
			{
				changelogFile: "CHANGELOG.md",
			},
		],
		"@semantic-release/npm",
		[
			"@semantic-release/git",
			{
				assets: ["CHANGELOG.md", "package.json", "package-lock.json"],
				message: "chore(release): ${nextRelease.version} [skip actions]\n\n${nextRelease.notes}",
			},
		],
		[
			"@semantic-release/github",
			{
				assets: [
					{
						path: "dist.zip",
						name: "autokitteh-web-${nextRelease.gitTag}.zip",
						label: "autokitteh-web-${nextRelease.gitTag}.zip",
					},
					{
						path: "dist.zip.sha256",
						name: "autokitteh-web-${nextRelease.gitTag}.zip.sha256",
						label: "autokitteh-web-${nextRelease.gitTag}.zip.sha256",
					},
				],
				successComment:
					":tada: This release is now available on [GitHub](${releases.filter(release => /github/i.test(release.name))[0].url})",
				failTitle: "The release from branch ${branch.name} had failed",
				failComment:
					"The release from branch ${branch.name} with version ${nextRelease.version} has failed due to the following errors:\n- ${errors.map(err => err.message).join('\\n- ')}",
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
						"$release_notes\t\n\n" +
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
