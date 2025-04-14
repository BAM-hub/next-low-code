import { useDraggable } from "@dnd-kit/core";
import { ElementSlot } from "./types";

function Draggable(props: {
  id: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  meta?: ElementSlot;
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
export default Draggable;
