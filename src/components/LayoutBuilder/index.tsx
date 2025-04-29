"use client";
import React, {
  Children,
  Fragment,
  isValidElement,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { nanoid } from "nanoid";
import { ElementSlot, MovedChildernMeta, Slot } from "./types";
import Draggable from "./Draggable";
import RenderElements from "./RenderElements";
import { removeFromSlot } from "./utils";
import RenderSlots from "./RenderSlots";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { z } from "zod";

const serverComponentObject = z.object({
  _owner: z.object({
    env: z.string(),
  }),
});

function isServerComponent(child: unknown) {
  if (isValidElement(child)) {
    try {
      const paresdChild = serverComponentObject.parse(child);
      return paresdChild._owner.env === "Server";
    } catch {
      return false;
    }
  }
  return false;
}

const Admin = ({ children }: PropsWithChildren) => {
  const prevMovedChildren = useRef<MovedChildernMeta[]>([]);
  const firstRender = useRef<boolean>(true);
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
  }, [data?.components, children]);

  useEffect(() => {
    const initialMovedChildern = mergedChildren?.map((child, idx) => {
      return {
        key: idx.toString(),
        isMoved: false,
        slot: [],
        props: {},
        isServer: isServerComponent(child),
      };
    });
    const childrenKeys = mergedChildren.map((child) =>
      isValidElement(child) ? child.key : null
    );
    const prevChidlrenKeys = prevMovedChildren.current.map((child) =>
      isValidElement(child) ? child.key : null
    );
    const isChanged =
      childrenKeys.length === prevChidlrenKeys.length
        ? childrenKeys.filter((movedChild, index) => {
            return movedChild === prevChidlrenKeys[index];
          }).length > 0
        : true;
    if (isChanged) {
      if (firstRender.current && !isLoading && mergedChildren.length > 0) {
        prevMovedChildren.current = initialMovedChildern;
        setMovedChildern(initialMovedChildern);
        firstRender.current = false;
      } else {
        // @Todo handle state change types inorder to handle server components
        console.log("todo");
      }
    }
  }, [movedChildern, isLoading, mergedChildren]);

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

  async function handleDragEnd(event: DragEndEvent) {
    console.log(event);
    if (event.over) {
      const target = event.active.data.current as Slot;
      let newMovedChildern = movedChildern;
      if (target) {
        newMovedChildern = changeSlot(event);
        setMovedChildern(newMovedChildern);
        return;
      }
      const childToAdd = newMovedChildern.filter(
        (child) => child.key.toString() === event.active.id
      );
      if (childToAdd[0] && childToAdd[0].isServer) {
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

  const { mutate } = useMutation({
    mutationFn: async () => {
      await fetch("/api/admin/props", {
        method: "POST",
        body: JSON.stringify({
          filename: "test",
          componentName: "Button",
          data: {
            msg: "test",
            extra: 5,
            title: "5",
          },
        }),
      });
    },
  });

  // if (isLoading || movedChildern?.length === 0) return <div>loading...</div>;
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
      <Button onClick={() => mutate()}>add Props</Button>
    </DndContext>
  );
};

export default Admin;
