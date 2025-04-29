export type ElementSlot = {
  slotKey: string;
  forkMeta: {
    parentId: string;
    id: string;
  };
  props?: any;
};

export type MovedChildernMeta = {
  key: string;
  isServer: boolean;
  isMoved: boolean;
  slot: ElementSlot[];
};

export type Slot = {
  parentId: string | null;
  id: string;
  classNames: string;
  type: "1col" | "2col";
};

export type DialogRefType = {
  open: (parentId?: string) => void;
  close: () => void;
};

export type NextPageSearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;
