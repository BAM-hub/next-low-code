import { NextRequest } from "next/server";
import * as schema from "@/db/schema";
import { db } from "@/db/drizzle";
import { RequestBody } from "@/types";
import { getPages } from "@/app/services/pages";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RequestBody;

  const page = await db.insert(schema.Page).values({
    name: body.name,
    slug: body.slug,
    description: body.description,
    isPublished: body.isPublished,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return Response.json({
    result: { page },
  });
}

export async function GET() {
  try {
    const pages = await getPages();
    console.log(pages);
    return Response.json({
      result: { pages },
    });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return Response.json({
      result: { error },
    });
  }
}
