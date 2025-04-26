import { cloneElement, Fragment } from "react";
import { createPortal } from "react-dom";
import { ElementSlot, MovedChildernMeta } from "./types";
import { removeFromSlot } from "./utils";
import Draggable from "./Draggable";

function RenderElements({
  isClient,
  slots,
  Element,
  movedChildern,
  setMovedChildren,
}: {
  isClient: boolean;
  slots: ElementSlot[];
  Element: React.ReactElement;
  movedChildern: MovedChildernMeta[];
  setMovedChildren: React.Dispatch<React.SetStateAction<MovedChildernMeta[]>>;
}) {
  if (!slots) return null;
  return slots.map((slot) => {
    return (
      <Fragment key={slot.forkMeta.id}>
        {createPortal(
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
              id={slot.forkMeta.id}
              meta={slot}
            >
              {isClient ? (
                cloneElement(Element, {
                  key: slot.forkMeta.id,
                  ...slot.props,
                })
              ) : (
                <>{Element}</>
              )}
            </Draggable>
          </div>,
          document.getElementById(slot.slotKey)!
        )}
      </Fragment>
    );
  });
}

export default RenderElements;
