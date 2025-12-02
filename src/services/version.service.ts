/* eslint-disable no-console */
import { GitHubRelease } from "@interfaces/services";

export class VersionService {
	private static readonly GITHUB_RELEASES_URL =
		"https://api.github.com/repos/autokitteh/web-platform/releases/latest";
	private static readonly LAST_CHECK_KEY = "ak_last_version_check";
	private static readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000;

	static getCurrentVersion(): string {
		if (import.meta.env.VITE_APP_VERSION) {
			return import.meta.env.VITE_APP_VERSION;
		}
		throw new Error("No version found in the environment variables");
	}

	static shouldCheckVersion(): boolean {
		const lastCheck = localStorage.getItem(this.LAST_CHECK_KEY);
		if (!lastCheck) return true;

		const lastCheckTime = parseInt(lastCheck, 10);
		const now = Date.now();
		return now - lastCheckTime > this.CHECK_INTERVAL;
	}

	static updateLastCheckTime(): void {
		localStorage.setItem(this.LAST_CHECK_KEY, Date.now().toString());
	}

	static compareVersions(v1: string, v2: string): number {
		const version1 = v1.replace(/^v/, "");
		const version2 = v2.replace(/^v/, "");

		const parts1 = version1.split(".").map(Number);
		const parts2 = version2.split(".").map(Number);

		const maxLength = Math.max(parts1.length, parts2.length);

		for (let i = 0; i < maxLength; i++) {
			const part1 = parts1[i] || 0;
			const part2 = parts2[i] || 0;

			if (part1 < part2) return -1;
			if (part1 > part2) return 1;
		}

		return 0;
	}

	static async getLatestRelease(): Promise<GitHubRelease | null> {
		try {
			const response = await fetch(this.GITHUB_RELEASES_URL, {
				headers: {
					Accept: "application/vnd.github.v3+json",
				},
			});

			if (!response.ok) {
				console.warn(`Failed to fetch latest release: ${response.status} ${response.statusText}`);
				return null;
			}

			const release: GitHubRelease = await response.json();
			return release;
		} catch (error) {
			console.warn("Error fetching latest release:", error);
			return null;
		}
	}

	/**
	 * Check for updates and log if newer version is available
	 */
	static async checkForUpdates(): Promise<void> {
		if (!this.shouldCheckVersion()) {
			return;
		}

		const currentVersion = this.getCurrentVersion();
		const latestRelease = await this.getLatestRelease();

		if (!latestRelease) {
			this.updateLastCheckTime();
			return;
		}

		const latestVersion = latestRelease.tag_name;
		const comparison = this.compareVersions(currentVersion, latestVersion);

		if (comparison < 0) {
			console.info(
				`🚀 New version available!\n` +
					`Current: ${currentVersion}\n` +
					`Latest: ${latestVersion}\n` +
					`Release: ${latestRelease.name}\n` +
					`Published: ${new Date(latestRelease.published_at).toLocaleDateString()}\n` +
					`URL: ${latestRelease.html_url}`
			);
		} else if (comparison === 0) {
			console.info(`✅ You're using the latest version (${currentVersion})`);
		} else {
			console.info(
				`🧪 You're using a development version (${currentVersion}) newer than latest release (${latestVersion})`
			);
		}

		this.updateLastCheckTime();
	}

	/**
	 * Initialize version tracking for the app
	 */
	static initializeVersionTracking(): void {
		this.checkForUpdates().catch((error) => {
			console.warn("Failed to check for updates:", error);
		});
	}
}
