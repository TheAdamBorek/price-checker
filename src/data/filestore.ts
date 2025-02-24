import fs from "fs";

import path from "path";
import { ItemData } from "./item-data";
import { env } from "../env";
const dataFile = path.join(env.PRICE_CHECKER__DB_DIR, "data.json");

function ensureDirectoriesExistSync(filePath: string) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

export function readPreviousData(): { [url: string]: ItemData } {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(data);
  }
  return {};
}

export function writeData(data: { [url: string]: ItemData }) {
  ensureDirectoriesExistSync(dataFile);
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}
