import { cloneElement, Fragment } from "react";
import { createPortal } from "react-dom";
import { ElementSlot, MovedChildernMeta } from "./types";
import { removeFromSlot } from "./utils";
import Draggable from "./Draggable";
import { useShouldRender } from "@/hooks/useShouldRender";

function RenderElements({
  isClient,
  slots,
  Element,
  isPreview = false,
  movedChildern,
  setMovedChildren,
}: {
  isClient: boolean;
  slots: ElementSlot[];
  Element: React.ReactElement;
  movedChildern: MovedChildernMeta[];
  isPreview?: boolean;
  setMovedChildren: React.Dispatch<React.SetStateAction<MovedChildernMeta[]>>;
}) {
  if (!slots.length) return null;
  return slots.map((slot) => {
    if (!slot.forkMeta.id) return null;
    return (
      <Fragment key={slot.forkMeta.id + slot.slotKey}>
        <RenderSlotItem
          slot={slot}
          isClient={isClient}
          Element={Element}
          isPreview={isPreview}
          movedChildern={movedChildern}
          setMovedChildren={setMovedChildren}
        />
      </Fragment>
    );
  });
}

function RenderSlotItem({
  slot,
  Element,
  movedChildern,
  setMovedChildren,
  isClient,
  isPreview = false,
}: {
  slot: ElementSlot;
  Element: React.ReactElement;
  movedChildern: MovedChildernMeta[];
  setMovedChildren: React.Dispatch<React.SetStateAction<MovedChildernMeta[]>>;
  isClient: boolean;
  isPreview?: boolean;
}) {
  const shouldRender = useShouldRender(slot.slotKey);
  if (!shouldRender) return null;

  if (isPreview) {
    return createPortal(
      <div className="">
        {isClient ? (
          cloneElement(Element, {
            key: slot.forkMeta.id + slot.slotKey,
            ...slot.props,
          })
        ) : (
          <>{Element}</>
        )}
      </div>,
      document.getElementById(slot.slotKey)!
    );
  }

  return createPortal(
    <div className="relative w-fit group">
      <button
        className="absolute -right-1 -top-1 rounded-full bg-red-500 aspect-square group-hover:block hidden cursor-pointer"
        onClick={() => {
          const newMovedChildern = removeFromSlot(
            slot,
            slot.forkMeta.id,
            movedChildern
          );
          setMovedChildren(newMovedChildern);
        }}
      >
        <span className="p-2 text-white">x</span>
      </button>
      <Draggable
        id={slot.forkMeta.id + "-" + slot.slotKey}
        meta={slot}
      >
        {isClient ? (
          cloneElement(Element, {
            key: slot.forkMeta.id + "-" + slot.slotKey,
            ...slot.props,
          })
        ) : (
          <>{Element}</>
        )}
      </Draggable>
    </div>,
    document.getElementById(slot.slotKey)!
  );
}

export default RenderElements;
