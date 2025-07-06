import { useSyncExternalStore } from "react";

export function useShouldRender(id: string | null) {
  console.log("updated");
  const shouldRender = useSyncExternalStore(subscribe, () => getSnapshot(id));
  return shouldRender;
}

function getSnapshot(id: string | null) {
  if (!id) return true;
  return !!document.getElementById(id);
}

function subscribe(callback: () => void): () => void {
  const parent = document.getElementById("slot-container");
  const observer = new MutationObserver(() => {
    callback();
  });

  if (!parent) {
    return () => {};
  }

  observer.observe(parent, {
    childList: true,
    subtree: true,
  });
  return () => {
    observer.disconnect();
  };
}
