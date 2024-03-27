import { test, expect } from "@playwright/test";

test("Change project name", async ({ page }) => {
	await page.goto("");
	await page.getByRole("button", { name: "New Project" }).click();
	await page.getByRole("textbox", { name: "Rename" }).click();
	await page.getByRole("textbox", { name: "Rename" }).fill("Grankie_0121");
	expect(page.getByText("Grankie_0121")).toBeTruthy();
});
