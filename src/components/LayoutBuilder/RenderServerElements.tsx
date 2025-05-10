"use server";

import { getComponents } from "@/app/services/components";
import { NextPageSearchParams } from "./types";

const serverComponentsPathsJson = await getComponents(true);

const serverComponents = await Promise.all(
  serverComponentsPathsJson.map(async (path) => {
    const file = await import(`../../components/serverElements/${path}`);
    return file.default;
  })
);

export async function addServerElement(key: number) {
  const target = serverComponents[key];
  if (target) {
    serverComponents.push(target);
  }
}

const RenderServerElements = async (props: {
  searchParams: NextPageSearchParams;
}) => {
  if (!serverComponents.length) return null;

  return (
    <>
      {serverComponents.map((Component, index) => {
        return <Component key={index} />;
      })}
    </>
  );
};

export default RenderServerElements;
