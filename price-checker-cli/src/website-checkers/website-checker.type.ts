export interface WebsiteChecker {
	isAvailable(html: string): boolean;
	getPrice(html: string): number | undefined;
}
