"use client";
import React, {
  Children,
  Fragment,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from "react";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { nanoid } from "nanoid";
import { ElementSlot, MovedChildernMeta, Slot } from "./types";
import Draggable from "./Draggable";
import RenderElements from "./RenderElements";
import { removeFromSlot } from "./utils";
import RenderSlots from "./RenderSlots";
import { useRouter } from "next/navigation";

const Admin = ({ children }: PropsWithChildren) => {
  const [movedChildern, setMovedChildern] = useState<MovedChildernMeta[]>([]);
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["availableComponents"],
    queryFn: async () => {
      const params = new URLSearchParams({ type: "client" });
      const res = await fetch(`/api/admin/ui/availableComponents?${params}`);
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
          return dynamic(async () => await import("../elements/" + dir));
        }, <div>loading...</div>)
      );
      return {
        components: Elements,
      };
    },
  });

  const mergedChildren = useMemo(() => {
    const childrenArray = Children.toArray(children);
    console.log({ childrenArray });

    return [...(data?.components || []), ...childrenArray];
  }, [data?.components]);

  useEffect(() => {
    if (!mergedChildren?.length) return;
    const initialMovedChildern = mergedChildren?.map((_, idx) => {
      return {
        key: idx.toString(),
        isMoved: false,
        slot: [],
        props: {},
      };
    });
    setMovedChildern(initialMovedChildern);
  }, [mergedChildren]);

  function changeSlot(event: DragEndEvent) {
    const target = event.active.data.current as ElementSlot;
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
    console.log(event);
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
                props: {
                  title: "hello",
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
        event.active.data.current as ElementSlot,
        event.active.id,
        movedChildern
      );
      setMovedChildern(newMovedChildern);
    }
  }

  if (isLoading || movedChildern?.length === 0) return <div>loading...</div>;
  return (
    <DndContext onDragEnd={handleDragEnd}>
      {mergedChildren?.map((Child, idx) => {
        const moved = movedChildern[idx];
        return (
          <Fragment key={idx}>
            <Draggable
              key={idx}
              id={idx.toString()}
            >
              {typeof Child === "function" ? <Child /> : <>{Child}</>}
            </Draggable>
            {moved && moved.isMoved && (
              <RenderElements
                slots={moved.slot}
                isClient={typeof Child === "function"}
                Element={
                  typeof Child === "function" ? (
                    React.cloneElement(<Child />, {
                      key: "sd",
                    })
                  ) : (
                    <>{Child}</>
                  )
                }
                movedChildern={movedChildern}
                setMovedChildren={setMovedChildern}
              />
            )}
          </Fragment>
        );
      })}
      <RenderSlots
        movedChildern={movedChildern}
        setMovedChildren={setMovedChildern}
      />
      <button onClick={() => router.refresh()}>refetch</button>
    </DndContext>
  );
};

export default Admin;
