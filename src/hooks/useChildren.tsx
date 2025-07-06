import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Children, cloneElement, useEffect, useMemo } from "react";

export default function useChildren(children: React.ReactNode) {
  const params = useSearchParams();

  const { data: clientComponents, isLoading: isLoadingCLient } = useQuery({
    queryKey: ["availableComponents"],
    queryFn: async () => {
      try {
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
            return dynamic(
              async () => await import("../components/elements/" + dir)
            );
          })
        );

        return {
          components: Elements.map((Element, idx) => {
            return cloneElement(<Element />, {
              ...Element.props,
              "data-id": data.result.components[idx],
            });
          }),
        };
      } catch (error) {
        console.error("Error fetching available components:", error);
        return { components: [] };
      }
    },
  });

  const { isLoading: isLoadingSlots, data: slots } = useQuery({
    queryKey: ["init_slots", params.get("pageId")],
    queryFn: async () => {
      const res = await fetch(
        `/api/admin/slots?pageId=${params.get("pageId")}`
      );
      const data = (await res.json()) as { data: Slot[] };
      return data.data;
    },
  });
  const { data: initialMovedChildern } = useQuery({
    queryKey: ["initialMovedChildern", params.get("pageId")],
    queryFn: async () => {
      const res = await fetch(
        "/api/admin/components?pageId=" + params.get("pageId")
      );
      const data = await res.json();
      console.log(data);
      return data.result.components;
    },
    enabled: !!slots,
  });

  const mergedChildren = useMemo(() => {
    const childrenArray = Children.toArray(children);
    return [...(clientComponents?.components || []), ...childrenArray];
  }, [clientComponents?.components, children]);

  return {
    mergedChildren,
    isLoading: isLoadingCLient || isLoadingSlots,
    slots,
    initialMovedChildern,
  };
}
