import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

type ResponseData = {
  result: { components: { name: string }[] };
};
export const dynamic = "force-static";
export async function GET(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const dirArray = fs.readdirSync("./src/components/elements/");
  console.log(dirArray);
  return Response.json({
    result: {
      components: dirArray.map((dir) => {
        return {
          name: dir.replace(/\.tsx$/, ""),
        };
      }),
    },
  });
}
