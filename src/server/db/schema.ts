import { relations } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * Multi-project schema prefix for Drizzle ORM.
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `price-checker_${name}`);

export const items = createTable(
	"item",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		url: d.text().notNull().unique(),
		title: d.text().notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date())
			.notNull(),
	}),
	(t) => [index("item_url_idx").on(t.url)],
);

export const itemsRelations = relations(items, ({ many }) => ({
	checks: many(checks),
}));

export const checks = createTable(
	"check",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		itemId: d
			.integer()
			.notNull()
			.references(() => items.id, { onDelete: "cascade" }),
		price: d.numeric({ precision: 10, scale: 2 }),
		availableInStoresCount: d.integer().notNull().default(0),
		checkedAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.$onUpdate(() => new Date())
			.notNull(),
	}),
	(t) => [index("check_item_id_idx").on(t.itemId)],
);

export const checksRelations = relations(checks, ({ one }) => ({
	item: one(items, {
		fields: [checks.itemId],
		references: [items.id],
	}),
}));
