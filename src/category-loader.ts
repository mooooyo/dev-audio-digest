import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import type { CategoryConfig } from "./types.js";

const CATEGORIES_DIR = join(import.meta.dirname, "..", "categories");

export function loadCategory(filename: string): CategoryConfig {
  const filepath = join(CATEGORIES_DIR, filename);
  const content = readFileSync(filepath, "utf-8");
  return parse(content) as CategoryConfig;
}

export function loadAllCategories(): CategoryConfig[] {
  const files = readdirSync(CATEGORIES_DIR).filter((f) => f.endsWith(".yaml"));
  return files.map(loadCategory).filter((c) => c.enabled);
}
