"use client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import React, { Fragment, useRef } from "react";
import { createPortal } from "react-dom";

const Page = () => {
  const params = useSearchParams();

  const containerRef = useRef<HTMLDivElement>(null);

  const { isLoading, data } = useQuery({
    queryKey: ["init_slots", params.get("pageId")],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/slots?pageId=${params.get("pageId")}`
      );
      const data = (await res.json()) as { data: Slot[] };
      return data.data;
    },
  });

  return (
    <div
      id="slot-container"
      ref={containerRef}
    >
      {isLoading && <div>Loading...</div>}
      {data?.map((slot) => {
        if (slot.parentId) {
          return (
            <RenderSlotWithParent
              key={slot.id}
              slot={slot}
            />
          );
        }
        return (
          <div key={slot.id}>
            <div
              id={slot.id}
              className={cn(slot.classNames)}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

const RenderSlotWithParent = ({ slot }: { slot: Slot }) => {
  const shouldRender = useShouldRender(slot.parentId);
  if (!shouldRender) return null;
  return (
    <Fragment key={slot.id}>
      {createPortal(
        <div key={slot.id}>
          <div
            id={slot.id}
            className={cn(slot.classNames)}
          ></div>
        </div>,
        document.getElementById(slot.parentId!)!
      )}
    </Fragment>
  );
};

import { useSyncExternalStore } from "react";
import { Slot } from "@/components/LayoutBuilder/types";

export function useShouldRender(id: string | null) {
  const shouldRender = useSyncExternalStore(subscribe, () => getSnapshot(id));
  return shouldRender;
}

function getSnapshot(id: string | null) {
  if (!id) return true;
  return !!document.getElementById(id);
}

function subscribe(callback: () => void): () => void {
  const parent = document.getElementById("slot-container");
  const observer = new MutationObserver(() => {
    callback();
  });

  if (!parent) {
    return () => {};
  }

  observer.observe(parent, {
    childList: true,
    subtree: true,
  });
  return () => {
    observer.disconnect();
  };
}

export default Page;
