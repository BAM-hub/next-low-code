import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { slotInserteSchema } from "@/db/schema";
import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const postSchema = z.object({
  data: z.array(slotInserteSchema),
  pageId: z.string(),
});

export async function POST(request: Request) {
  try {
    // currently will ignore patch and use this for both
    const json = await request.json();
    const body = postSchema.parse(json);

    await db.transaction(async (tx) => {
      await tx.delete(schema.Slot).where(eq(schema.Slot.pageId, body.pageId));
      if (body.data.length > 0) {
        await tx.insert(schema.Slot).values(body.data).returning();
      }
    });

    return NextResponse.json({ message: "slots saved" });
  } catch (error) {
    console.error(error);
    return new NextResponse("Somthing went wrong", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const pageId = request.nextUrl.searchParams.get("pageId");
    const slots = await db
      .select()
      .from(schema.Slot)
      .where(eq(schema.Slot.pageId, pageId as string));

    return NextResponse.json({
      data: slots,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("File not found", { status: 404 });
  }
}
