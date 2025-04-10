"use client";

const Test = (props) => {
  console.log({ props });
  return <div className="">{props.title || "Button"}</div>;
};

export default Test;
