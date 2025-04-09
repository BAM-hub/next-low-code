"use client";
import { createPortal } from "react-dom";
import React, {
  Fragment,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { DndContext, DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { nanoid } from "nanoid";

type Slot = {
  slotKey: string;
  forkMeta: {
    parentId: string;
    id: string;
  };
};

type MovedChildernMeta = {
  key: string;
  isMoved: boolean;
  slot: Slot[];
  props?: object;
};

function Draggable(props: {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  meta?: Slot;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: props.id,
    data: props.meta,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      className="p-4 border-2 w-fit"
      style={style}
      {...listeners}
      {...attributes}
    >
      {props.children}
    </div>
  );
}

function removeFromSlot(
  slot: Slot,
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
function Droppable(props: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "bg-inherit transition-all border-2 border-dashed p-4 rounded-md",
        isOver && "bg-green-200"
      )}
    >
      {props.children}
    </div>
  );
}

const Admin = ({}: PropsWithChildren) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const dropRef1 = useRef<HTMLDivElement>(null);
  const [movedChildern, setMovedChildern] = useState<MovedChildernMeta[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["availableComponents"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ui/availableComponents");
      const data: {
        result: {
          components: {
            name: string;
            props: object;
          }[];
        };
      } = await res.json();
      const Elements = await Promise.all(
        data.result.components?.map((dir) => {
          return dynamic(async () => await import("../elements/" + dir.name));
        })
      );

      return {
        components: Elements,
      };
    },
  });

  useEffect(() => {
    if (!data?.components.length) return;
    const initialMovedChildern = data?.components?.map((_, idx) => {
      return {
        key: idx.toString(),
        isMoved: false,
        slot: [],
        props: {},
      };
    });
    setMovedChildern(initialMovedChildern);
  }, [data?.components]);

  function changeSlot(event: DragEndEvent) {
    const target = event.active.data.current as Slot;
    const parentId = target.forkMeta.parentId;
    const id = target.forkMeta.id;

    const newMovedChildern = movedChildern.map((child) => {
      if (parentId === child.key) {
        const newSlots = child.slot.filter((slot) => {
          return slot.forkMeta.id !== id && event.active.id === id;
        });
        return {
          ...child,
          slot: [
            ...newSlots,
            {
              slotKey: event.over!.id,
              forkMeta: {
                id: nanoid(),
                parentId: child.key,
              },
            },
          ],
        };
      }

      return child;
    }) as MovedChildernMeta[];
    return newMovedChildern;
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.over) {
      const target = event.active.data.current as Slot;
      let newMovedChildern = movedChildern;
      if (target) {
        newMovedChildern = changeSlot(event);
        setMovedChildern(newMovedChildern);
        return;
      }

      newMovedChildern = newMovedChildern.map((child) => {
        if (child.key.toString() === event.active.id) {
          return {
            ...child,
            isMoved: true,
            slot: [
              ...child.slot,
              {
                slotKey: event.over!.id,
                forkMeta: {
                  id: nanoid(),
                  parentId: child.key,
                },
              },
            ],
          } as MovedChildernMeta;
        }
        return child;
      });
      setMovedChildern(newMovedChildern);
    } else {
      const newMovedChildern = removeFromSlot(
        event.active.data.current as Slot,
        event.active.id,
        movedChildern
      );
      setMovedChildern(newMovedChildern);
    }
  }

  if (isLoading || movedChildern?.length === 0) return <div>loading...</div>;
  return (
    <DndContext onDragEnd={handleDragEnd}>
      {data?.components?.map((Child, idx) => {
        const moved = movedChildern[idx];
        return (
          <Fragment key={idx}>
            <Draggable
              key={idx}
              id={idx.toString()}
            >
              <Child />
            </Draggable>
            {moved && moved.isMoved && (
              <RenderSlots
                slots={moved.slot}
                Element={React.cloneElement(<Child />, {
                  key: "sd",
                })}
                movedChildern={movedChildern}
                setMovedChildren={setMovedChildern}
              />
            )}
          </Fragment>
        );
      })}

      <Droppable id="dropable">
        <div
          ref={dropRef}
          id="dropable"
        ></div>
      </Droppable>
      <Droppable id="dropable-1">
        <div
          ref={dropRef1}
          id="dropable-1"
        ></div>
      </Droppable>
    </DndContext>
  );
};

function RenderSlots({
  slots,
  Element,
  movedChildern,
  setMovedChildren,
}: {
  slots: Slot[];
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
              {React.cloneElement(Element, {
                key: slot.forkMeta.id,
              })}
            </Draggable>
          </div>,
          document.getElementById(slot.slotKey)!
        )}
      </Fragment>
    );
  });
}

export default Admin;
