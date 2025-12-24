import * as cheerio from "cheerio";
import type { WebsiteChecker } from "./website-checker.type";

export class PortalgamesChecker implements WebsiteChecker {
	isAvailable(html: string): boolean {
		const $ = cheerio.load(html);
		const hasAddToCart =
			$("button").filter((i, element) => {
				const text = $(element).text().toLowerCase();
				return text.includes("do koszyka");
			}).length > 0;

		return hasAddToCart;
	}

	getPrice(html: string): number | undefined {
		const $ = cheerio.load(html);
		const priceText = $(".price").text().trim();
		// Parse price (e.g., "123,45 zł" -> 123.45)
		const match = priceText.match(/(\d+,\d+)/);
		return match ? parseFloat(match[1].replace(",", ".")) : undefined;
	}
}
