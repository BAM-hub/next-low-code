import React from "react";
import { Button } from "../ui/button";

const test1 = (props: { title: string }) => {
  return (
    <div>
      <Button>
        <div className="">{props.title || "Button"}</div>
      </Button>
    </div>
  );
};

export default test1;
