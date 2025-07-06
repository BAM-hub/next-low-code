"use client";
import RenderElements from "@/components/LayoutBuilder/RenderElements";
import { useShouldRender } from "@/hooks/useShouldRender";
import { cn } from "@/lib/utils";
import React, { Fragment, memo, PropsWithChildren, useRef } from "react";
import { createPortal } from "react-dom";
import { Slot } from "../LayoutBuilder/types";
import useChildren from "@/hooks/useChildren";

const LayoutPreivew = (props: PropsWithChildren) => {
  const { initialMovedChildern, slots, isLoading, mergedChildren } =
    useChildren(props.children);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      id="slot-container"
      ref={containerRef}
    >
      {isLoading && <div>Loading...</div>}
      <MapChildern
        mergedChildren={mergedChildren}
        initialMovedChildern={initialMovedChildern}
      />

      {slots?.map((slot) => {
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

export default LayoutPreivew;

const MapChildern = memo(({ mergedChildren, initialMovedChildern }) => {
  return mergedChildren?.map((Child, idx) => {
    if (!initialMovedChildern) return null;
    const moved = initialMovedChildern[idx];
    return (
      <Fragment key={idx}>
        {moved && moved.isMoved && (
          <RenderElements
            isPreview={true}
            slots={moved.slot}
            isClient={typeof Child === "function"}
            Element={typeof Child === "function" ? <Child /> : <>{Child}</>}
            movedChildern={initialMovedChildern}
            setMovedChildren={() => {}}
          />
        )}
      </Fragment>
    );
  });
});
MapChildern.displayName = "MapChildern";

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
