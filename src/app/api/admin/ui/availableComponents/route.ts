import { getComponents } from "@/app/services/components";
import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { NextRequest } from "next/server";

// export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  if (!type) {
    return Response.json({
      error: "type param is required",
    });
  }

  const serverComponents = await getComponents(type === "server");

  return Response.json({
    result: {
      components: serverComponents,
    },
  });
}

type AddComponentRequest = {
  name: string;
  isServer: boolean;
}[];

export async function POST(request: Request) {
  const body = (await request.json()) as AddComponentRequest;
  const component = await db
    .insert(schema.Component)
    .values(
      body.map((component) => ({
        name: component.name,
        path: component.name,
        isServer: component.isServer,
      }))
    )
    .returning()
    .onConflictDoNothing();
  return Response.json({
    result: {
      component,
    },
  });
}
