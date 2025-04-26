"use server";

import { getComponents } from "@/app/services/components";
import { NextPageSearchParams } from "./types";

const RenderServerElements = async (props: {
  searchParams: NextPageSearchParams;
}) => {
  const serverComponentsPathsJson = await getComponents(true);

  const serverComponents = await Promise.all(
    serverComponentsPathsJson.map(async (path) => {
      const file = await import(`../../components/serverElements/${path}`);
      return file.default;
    })
  );

  if (!serverComponents.length) return null;

  return (
    <>
      {serverComponents.map((Component, index) => {
        return <Component key={Math.random()} />;
      })}
    </>
  );
};

export default RenderServerElements;
