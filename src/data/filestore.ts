import fs from "fs";

import path from "path";
import { ItemData } from "./item-data";
const dataFile = path.join(__dirname, "data.json");

export function readPreviousData(): { [url: string]: ItemData } {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile, "utf-8");
    return JSON.parse(data);
  }
  return {};
}

export function writeData(data: { [url: string]: ItemData }) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}
