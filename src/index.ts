import axios from "axios";
import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { WebsiteChecker } from "./website-checkers/website-checker.type";
import { PortalgamesChecker } from "./website-checkers/portalgames-checker";
import { ItemData } from "./data/item-data";
import { readPreviousData, writeData } from "./data/filestore";

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!botToken || !chatId) {
  throw new Error(
    "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in .env",
  );
}

const bot = new TelegramBot(botToken, { polling: false });

const checkers: { [url: string]: WebsiteChecker } = {
  "https://sklep.portalgames.pl/root": new PortalgamesChecker(),
};

async function checkItems(chatId: string) {
  const previousData = readPreviousData();
  const newData: { [url: string]: ItemData } = {};

  for (const url in checkers) {
    try {
      const response = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }, // Basic user-agent to avoid blocks
      });
      const html = response.data;
      const checker = checkers[url];

      const available = checker.isAvailable(html);
      const price = checker.getPrice(html);

      newData[url] = { available, price };

      // Compare with previous state
      const prev = previousData[url];

      if (!prev) {
        await bot.sendMessage(
          chatId,
          `Initial Check\nItem is ${available ? "available" : "unavailable"}: ${url}, Price: ${price} zł`,
        );
      } else {
        if (prev.available && !available) {
          await bot.sendMessage(chatId, `Item no longer available: ${url}`);
        } else if (!prev.available && available) {
          await bot.sendMessage(
            chatId,
            `Item now available: ${url}, Price: ${price} zł`,
          );
        } else if (
          available &&
          price !== undefined &&
          prev.price !== undefined &&
          price < prev.price
        ) {
          await bot.sendMessage(
            chatId,
            `Price dropped for ${url}: ${prev.price} zł -> ${price} zł`,
          );
        }
      }
    } catch (error) {
      console.error(`Error checking ${url}:`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
  }

  writeData(newData);
}

cron.schedule(
  "0 0 8 * * *",
  () => {
    console.log("Running daily check at 8:00 AM");
    checkItems(chatId);
  },
  {
    timezone: "Europe/Warsaw", // Adjust to your timezone
  },
);

// Run once on startup for testing (optional)
checkItems(chatId).then(() => console.log("Initial check complete"));
