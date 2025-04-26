import * as schema from "@/db/schema";
import { db } from "@/db/drizzle";

export async function getPages() {
  const pages = await db.select().from(schema.Page);
  return pages;
}
