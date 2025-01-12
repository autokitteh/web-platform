/* eslint-disable no-console */
import { execSync } from "child_process";
import { copyFileSync, existsSync, rmSync, unlinkSync } from "fs";
import { join } from "path";

async function updateKittehubZip() {
	const tempDir = "temp-kittehub";
	const targetPath = join("src", "assets", "templates", "kittehub.zip");
	const backupPath = `${targetPath}.backup`;

	try {
		if (existsSync(targetPath)) {
			copyFileSync(targetPath, backupPath);
		}

		execSync(`git clone --branch release https://github.com/autokitteh/kittehub.git ${tempDir}`);

		const distZipPath = join(tempDir, "dist.zip");

		if (existsSync(distZipPath)) {
			copyFileSync(distZipPath, targetPath);

			console.log("Successfully updated kittehub.zip");
		} else {
			console.log("dist.zip not found in kittehub release branch, keeping current version");
			if (existsSync(backupPath)) {
				copyFileSync(backupPath, targetPath);
			}
		}
	} catch (error) {
		console.error("Error updating kittehub.zip:", error);
		if (existsSync(backupPath)) {
			copyFileSync(backupPath, targetPath);
		}
	} finally {
		if (existsSync(tempDir)) {
			rmSync(tempDir, { recursive: true, force: true });
		}
		if (existsSync(backupPath)) {
			unlinkSync(backupPath);
		}
	}
}

updateKittehubZip().catch(console.error);
