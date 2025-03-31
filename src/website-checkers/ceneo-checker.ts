import { WebsiteChecker } from "./website-checker.type";
import * as cheerio from "cheerio";
const priceSelector = ".price-format .price";

export class CeneoChecker implements WebsiteChecker {
  isAvailable(html: string): boolean {
    return this.getPrice(html) !== undefined;
  }

  getPrice(html: string): number | undefined {
    const $ = cheerio.load(html);
    const availableElement = $(priceSelector);
    if (availableElement.length === 0) return;

    const priceText = availableElement.text().trim();
    const price = Number(priceText);
    return isNaN(price) ? undefined : price;
  }
}
