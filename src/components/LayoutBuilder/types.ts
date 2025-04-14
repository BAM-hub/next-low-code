export type ElementSlot = {
  slotKey: string;
  forkMeta: {
    parentId: string;
    id: string;
  };
};

export type MovedChildernMeta = {
  key: string;
  isMoved: boolean;
  slot: ElementSlot[];
  props?: object;
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
