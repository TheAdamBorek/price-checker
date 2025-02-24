import fs from "fs";

import path from "path";
import { ItemData } from "./item-data";
const dataFile = path.join("/app/db/", "data.json");

function ensureDirectoriesExistSync(filePath: string) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

export function readPreviousData(): { [url: string]: ItemData } {
  if (!fs.existsSync(dataFile)) {
    console.log(`No previous data found at ${dataFile}`);
    return {};
  }
  const data = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(data);
}

export function writeData(data: { [url: string]: ItemData }) {
  ensureDirectoriesExistSync(dataFile);
  fs.writeFile(dataFile, JSON.stringify(data, null, 2), (err) => {
    console.error(`Error writing data into file: ${dataFile}`, err);
  });
}
