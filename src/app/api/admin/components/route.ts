import {
  ElementSlot,
  MovedChildernMeta,
} from "@/components/LayoutBuilder/types";
import { db } from "@/db/drizzle";
import * as schema from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

// export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return Response.json({
      error: "pageId param is required",
    });
  }

  //   const components = await getComponents();

  const components = await db
    .select()
    .from(schema.Component)
    .leftJoin(
      schema.ComponentToPage,
      eq(schema.Component.path, schema.ComponentToPage.componentId)
    )
    .leftJoin(
      schema.Slot,
      and(
        eq(schema.ComponentToPage.pageId, schema.Slot.pageId),
        eq(schema.ComponentToPage.slot, schema.Slot.id)
      )
    );

  const response = components.map((data) => {
    const { component, componenttopage, slot } = data;
    return {
      isMoved: !!slot,
      isServer: component.isServer,
      key: component.path,
      slot: [
        {
          slotKey: slot?.id,
          forkMeta: {
            parentId: slot?.parentId,
            id: componenttopage?.componentId,
          },
        },
      ] as ElementSlot[],
      // slot: slot.id,
    } as MovedChildernMeta;
  });

  const mergedData = Object.values(
    Object.groupBy(response, (item) => item.key)
  ).map((item) => {
    return item?.reduce((prev, curr) => {
      return {
        ...prev,
        slot: [...(prev.slot || []), ...(curr.slot || [])],
      };
    });
  });

  return Response.json({
    result: {
      components: mergedData,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { pageId, componentId, slot } = body;

  if (!pageId || !componentId) {
    return Response.json({
      error: "pageId and componentId are required",
    });
  }

  const componentToPage = await db
    .insert(schema.ComponentToPage)
    .values({
      pageId,
      componentId,
      slot,
    })
    .returning();

  return Response.json({
    result: {
      componentToPage,
    },
  });
}
