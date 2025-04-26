import * as schema from "@/db/schema";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";

export async function getComponents(isServer: boolean) {
  const serverComponentsPaths = await db
    .select()
    .from(schema.Component)
    .where(eq(schema.Component.isServer, isServer));

  const serverComponents = await Promise.all(
    serverComponentsPaths.map(async (path) => {
      return path.name;
    })
  );
  return serverComponents;
}
