import { UniqueIdentifier } from "@dnd-kit/core";
import { ElementSlot, MovedChildernMeta } from "./types";

export function removeFromSlot(
  slot: ElementSlot,
  actveId: UniqueIdentifier,
  movedChildern: MovedChildernMeta[]
) {
  const target = slot;
  const parentId = target.forkMeta.parentId;
  const id = target.forkMeta.id;

  const newMovedChildern = movedChildern.map((child) => {
    if (parentId === child.key) {
      const newSlots = child.slot.filter((slot) => {
        return slot.forkMeta.id !== id && actveId === id;
      });
      return {
        ...child,
        isMoved: newSlots.length > 0,
        slot: newSlots,
      };
    }

    return child;
  });
  return newMovedChildern;
}
