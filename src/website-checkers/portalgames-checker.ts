import { WebsiteChecker } from "~/website-checkers/website-checker.type";
import cheerio from "cheerio";

export class PortalgamesChecker implements WebsiteChecker {
  isAvailable(html: string): boolean {
    debugger;
    const $ = cheerio.load(html);
    return $('button:contains("Do Koszyka")').length > 0;
  }

  getPrice(html: string): number | undefined {
    const $ = cheerio.load(html);
    const priceText = $(".price").text().trim();
    // Parse price (e.g., "123,45 zł" -> 123.45)
    const match = priceText.match(/(\d+,\d+)/);
    return match ? parseFloat(match[1].replace(",", ".")) : undefined;
  }
}
