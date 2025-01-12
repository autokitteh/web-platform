/* eslint-disable no-console */
import dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
import OpenAI from "openai";
import { resolve } from "path";
import { parse } from "yaml";

async function generateTypes() {
	dotenv.config();

	// eslint-disable-next-line no-undef
	const openaiApiKey = process.env.OPEN_AI_KEY;

	if (!openaiApiKey) {
		console.error("Error: OpenAI API key is not specified.");

		return;
	}

	const schemaPath = resolve("src", "autokitteh", "manifest.schema.yaml");
	const outputPath = resolve("src", "interfaces/models", "manifest.interface.ts");

	const schemaContent = readFileSync(schemaPath, "utf-8");
	const schemaJSON = parse(schemaContent);

	const openai = new OpenAI({
		apiKey: openaiApiKey,
	});

	try {
		const prompt = `
        Based on the following JSON Schema, generate TypeScript interface definitions.
        Do not include any additional text, code block delimiters, or comments.
        Ensure all interfaces start with the 'export' keyword:
        
        Schema:
        ${JSON.stringify(schemaJSON, null, 2)}
        
        TypeScript interfaces:
        `;

		const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [{ role: "user", content: prompt }],
			max_tokens: 2000,
			temperature: 0,
		});

		const typescriptCode = response.choices?.[0]?.message?.content?.trim();

		if (typescriptCode) {
			writeFileSync(outputPath, typescriptCode);

			return;
		}

		console.error("Error: OpenAI response is empty.");
	} catch (error) {
		console.error("Error generating through OpenAI:", error);
	}
}

generateTypes().catch(console.error);
