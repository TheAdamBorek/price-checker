import * as cheerio from "cheerio";
import type { WebsiteChecker } from "./website-checker.type";

const priceElementClass = "div .grid .items-center div.text-purple-600";
const availableElementClass = "div .grid .items-center span.font-bold.ml-0\\.5";

export class PlanszeoChecker implements WebsiteChecker {
	isAvailable(html: string): boolean {
		const $ = cheerio.load(html);
		// Check if price exists and is not a dash
		const availableElement = $(availableElementClass);
		if (availableElement.length === 0) return false;
		const availableText = availableElement.text().trim();
		return availableText !== "Niedostępna";
	}

	getPrice(html: string): number | undefined {
		const $ = cheerio.load(html);
		const priceElement = $(priceElementClass);

		if (priceElement.length === 0) return undefined;
		const priceText = priceElement.text().trim();

		// Parse price (e.g., "459,99" -> 459.99)
		const match = priceText.match(/(\d+[\s\xa0]?)+[,.](\d+)/);
		if (!match) return undefined;

		// Remove any spaces in the number and replace comma with dot
		const cleanPrice = priceText.replace(/[\s\xa0]/g, "").replace(",", ".");
		const price = parseFloat(cleanPrice);
		return isNaN(price) ? undefined : price;
	}
}
