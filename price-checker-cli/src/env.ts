import dotenv from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
	dotenv.config();
}

const envSchema = z.object({
	PRICE_CHECKER__TELEGRAM_BOT_TOKEN: z.string(),
	PRICE_CHECKER__TELEGRAM_CHAT_ID: z.string(),
	PRICE_CHECKER__DB_DIR: z.string(),
});

export const env = envSchema.parse(process.env);
