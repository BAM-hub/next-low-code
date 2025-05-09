import {
  Fragment,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
  useTransition,
} from "react";
import { DialogRefType, MovedChildernMeta, Slot } from "./types";
import Droppable from "./Droppable";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { customAlphabet } from "nanoid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const randomNumber = customAlphabet("0123456789");

function RenderSlots({
  movedChildern,
  setMovedChildren,
}: {
  movedChildern: MovedChildernMeta[];
  setMovedChildren: React.Dispatch<React.SetStateAction<MovedChildernMeta[]>>;
}) {
  const params = useSearchParams();
  const [slots, setSlots] = useState<Slot[]>([]);
  const dialogRef = useRef<DialogRefType>(null);

  function getChildSlots(id: string, slots: Slot[]) {
    const childSlots = slots.filter((slot) => slot.parentId === id);
    if (childSlots.length === 0) return [];
    const allChildSlots: Slot[] = childSlots.reduce((acc, slot) => {
      return [...acc, slot, ...getChildSlots(slot.id, slots)];
    }, [] as Slot[]);
    return allChildSlots;
  }

  function deleteSlot(id: string) {
    const target = slots.find((slot) => slot.id === id);
    if (!target) return;
    const deletedSlots = getChildSlots(id, slots);
    deletedSlots.push(target);

    const newChildren = movedChildern.map((child) => {
      const newSlots = child.slot.filter(
        (slot) =>
          !deletedSlots.find((actualSlot) => actualSlot.id === slot.slotKey)
      );
      return {
        ...child,
        isMoved: newSlots.length > 0,
        slot: newSlots,
      };
    });
    setMovedChildren(newChildren);
    setSlots((prev) => {
      return prev.filter((slot) => {
        return !deletedSlots.find((actualSlot) => actualSlot.id === slot.id);
      });
    });
  }

  const { isLoading } = useQuery({
    queryKey: ["init_slots", params.get("page")],
    queryFn: async () => {
      const res = await fetch(`/api/admin/slots?pageId=${params.get("page")}`);
      const data = await res.json();
      setSlots(data.data);
      return data.data;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      fetch("/api/admin/slots", {
        method: "POST",
        body: JSON.stringify({
          data: slots.map((slot) => ({
            ...slot,
            pageId: params.get("page"),
          })),
          pageId: params.get("page"),
        }),
      });
    },
  });

  if (isLoading) return <div>loading ...</div>;

  return (
    <div>
      {slots.map((slot) => {
        if (slot.parentId) {
          const parent = document.getElementById(slot.parentId);
          if (!parent) return null;
          return (
            <Fragment key={slot.id}>
              {createPortal(
                <div key={slot.id}>
                  <Droppable
                    id={slot.id}
                    delete={deleteSlot}
                  >
                    <div
                      id={slot.id}
                      className={cn(slot.classNames)}
                    ></div>
                    <Button
                      className="w-full my-3"
                      onClick={() => dialogRef.current?.open(slot.id)}
                    >
                      +
                    </Button>
                  </Droppable>
                </div>,
                document.getElementById(slot.parentId)!
              )}
            </Fragment>
          );
        }
        return (
          <div key={slot.id}>
            <Droppable
              id={slot.id}
              delete={deleteSlot}
            >
              <div
                id={slot.id}
                className={cn(slot.classNames)}
              ></div>
              <Button
                className="w-full my-3"
                onClick={() => dialogRef.current?.open(slot.id)}
              >
                +
              </Button>
            </Droppable>
          </div>
        );
      })}
      <Modal
        ref={dialogRef}
        setSlots={setSlots}
      />
      <Button
        className="w-full my-3"
        onClick={() => dialogRef.current?.open()}
      >
        +
      </Button>
      <Button
        onClick={() => {
          console.log(movedChildern);
          console.log(slots);
        }}
      >
        show Data
      </Button>
      <Button
        onClick={() => {
          mutate();
        }}
      >
        Save
      </Button>
      <Link href={`/admin/preview?pageId=${params.get("page")}`}>preview</Link>
    </div>
  );
}

function Modal({
  ref,
  setSlots,
}: {
  ref: Ref<DialogRefType>;
  setSlots: React.Dispatch<React.SetStateAction<Slot[]>>;
}) {
  const context = useRef<{ parentId: string }>(null);
  const localRef = useRef<HTMLDialogElement>(null);
  const [, startTransition] = useTransition();
  useImperativeHandle(ref, () => ({
    open: (parentId) => {
      if (parentId) {
        context.current = { parentId };
      }
      localRef.current?.showModal();
    },
    close: () => {
      localRef.current?.close();
    },
  }));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const type = form.slotType.value;
    localRef.current?.close();
    if (!type) return;
    const slotsCount = type === "1col" ? 1 : 2;
    let parentSlot: Slot | null = null;
    if (slotsCount > 1) {
      parentSlot = {
        parentId: context.current?.parentId,
        id: randomNumber(),
        classNames: "grid grid-cols-2 gap-4",
        type: "1col",
      } as Slot;
    }

    const slots = new Array(slotsCount).fill(0).map(() => {
      return {
        parentId: parentSlot?.id || context.current?.parentId,
        id: randomNumber(),
        classNames: cn("flex gap-4", type === "1col" ? "w-full" : "flex-1"),
        type,
      } as Slot;
    });

    if (parentSlot) {
      setSlots((prev) => [...prev, parentSlot]);
      startTransition(() => {
        setSlots((prev) => [...prev, ...slots]);
      });
    } else {
      setSlots((prev) => [...prev, ...slots]);
    }
    context.current = null;
  }

  return (
    <dialog
      ref={localRef}
      className="rounded-md m-auto"
    >
      <div className="p-4 rounded-md bg-white shadow-lg">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Add New Slot</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="1col">1 column</label>
            <input
              type="radio"
              name="slotType"
              value="1col"
              id="1col"
              className="ml-2"
            />
            <label htmlFor="2col">2 column</label>
            <input
              type="radio"
              name="slotType"
              value="2col"
              id="2col"
              className="ml-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-md"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

export default RenderSlots;
