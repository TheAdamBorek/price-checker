import axios from "axios";
import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { WebsiteChecker } from "./website-checkers/website-checker.type";
import { PortalgamesChecker } from "./website-checkers/portalgames-checker";
import { ItemData } from "./data/item-data";
import { readPreviousData, writeData } from "./data/filestore";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
if (!botToken || !chatId) {
  throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in ENV");
}

const bot = new TelegramBot(botToken, { polling: false });

const checkers: { [url: string]: WebsiteChecker } = {
  "https://sklep.portalgames.pl/root-maruderzy": new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-podziemia": new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-plemiona-rzecznez":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-punkty-terenu": new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-tryby-lesnogrodu":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-paczka-wloczegow":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-playmata-zimowa": new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-zaciezni-podziemia":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-zaciezni-maruderow":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/pl/p/ROOT-Zywiczne-znaczniki-polan/2082":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-zaciezni-plemion-rzecznych":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-talia-banitow-i-partyzantow":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-playmata-gory-i-jeziora":
    new PortalgamesChecker(),
};

function getRandomFloat(to: number): number {
  return Math.random() * to + 1;
}

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

    await new Promise((resolve) =>
      setTimeout(resolve, Math.round(1000 * getRandomFloat(5))),
    );
  }

  writeData(newData);
}

cron.schedule(
  "0 0 9 * * *",
  () => {
    checkItems(chatId);
  },
  {
    timezone: "Europe/Warsaw", // Adjust to your timezone
  },
);

// Run once on startup for testing (optional)
checkItems(chatId).then(() => console.log("Initial check complete"));
