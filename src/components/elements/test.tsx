"use client";

import { useState } from "react";

const Test = (props) => {
  console.log({ props });
  const [count, setCount] = useState(0);
  return (
    <div
      className=""
      onClick={() => {
        setCount(count + 1);
      }}
      {...props}
    >
      {props.title || "Button"}
      {count}
    </div>
  );
};

export default Test;
