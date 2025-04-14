import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

function Droppable(props: {
  id: string;
  children: React.ReactNode;
  className?: string;
  delete: (id: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id,
  });

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        className={cn(
          "bg-inherit transition-all border-2 border-dashed p-4 rounded-md"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 -z-10 rounded-md",
            isOver && "bg-green-200"
          )}
        ></div>
        <button
          className="absolute -right-1 -top-1 rounded-full bg-red-500 aspect-square cursor-pointer"
          onClick={() => props.delete(props.id)}
        >
          <span className="p-2 text-white">x</span>
        </button>
        {props.children}
      </div>
    </div>
  );
}
export default Droppable;
