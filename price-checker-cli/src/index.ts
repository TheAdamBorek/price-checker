import axios from "axios";
import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import { WebsiteChecker } from "./website-checkers/website-checker.type";
import { PortalgamesChecker } from "./website-checkers/portalgames-checker";
import { PlanszeoChecker } from "./website-checkers/planszeo-checker";
import { ItemData } from "./data/item-data";
import { readPreviousData, writeData } from "./data/filestore";
import { env } from "./env";

const bot = new TelegramBot(env.PRICE_CHECKER__TELEGRAM_BOT_TOKEN, {
  polling: false,
});

const checkers: { [url: string]: WebsiteChecker } = {
  "https://sklep.portalgames.pl/root-maruderzy": new PortalgamesChecker(),
  "https://sklep.portalgames.pl/root-podziemia": new PortalgamesChecker(),
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
  "https://sklep.portalgames.pl/root-playmata-gory-i-jeziora":
    new PortalgamesChecker(),
  "https://sklep.portalgames.pl/dune-wojna-o-arrakis": new PortalgamesChecker(),
  "https://sklep.portalgames.pl/ankh": new PortalgamesChecker(),
  "https://planszeo.pl/gry-planszowe/root-podziemia": new PlanszeoChecker(),
  "https://planszeo.pl/gry-planszowe/dune-war-for-arrakis":
    new PlanszeoChecker(),
  "https://planszeo.pl/gry-planszowe/ankh-bogowie-egiptu":
    new PlanszeoChecker(),
  "https://planszeo.pl/gry-planszowe/marvel-dice-throne-scarlet-witch-v-thor-v-loki-v-spider-man":
    new PlanszeoChecker(),
  "https://planszeo.pl/gry-planszowe/marvel-dice-throne-kapitan-marvel-v-czarna-pantera-v-doktor-strange-v-czarna-wdowa":
    new PlanszeoChecker(),
  "https://planszeo.pl/gry-planszowe/unmatched-the-witcher-steel-and-silver":
    new PlanszeoChecker(),
  "https://planszeo.pl/gry-planszowe/unmatched-the-witcher-realms-fall":
    new PlanszeoChecker(),
  "https://planszeo.pl/gry-planszowe/wojna-o-pierscien-2-edycja":
    new PlanszeoChecker(),
  "https://planszeo.pl/gry-planszowe/the-white-castle-matcha":
    new PlanszeoChecker(),
};

function getRandomFloat(to: number): number {
  return Math.random() * to + 1;
}

async function checkItems() {
  const chatId = env.PRICE_CHECKER__TELEGRAM_CHAT_ID;
  const previousData = readPreviousData();
  const newData: { [url: string]: ItemData } = {};

  // Create an array of URLs and shuffle it
  const urls = Object.keys(checkers);
  const shuffledUrls = [...urls].sort(() => Math.random() - 0.5);

  for (const url of shuffledUrls) {
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
    checkItems();
  },
  {
    timezone: "Europe/Warsaw", // Adjust to your timezone
  },
);

// Run once on startup for testing (optional)
checkItems().then(() => console.log("Initial check complete"));
