import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";

type ResponseData = {
  result: { components: { name: string }[] };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const dirArray = fs.readdirSync("./src/components/elements/");
  console.log(dirArray);
  res.status(200).send({
    result: {
      components: dirArray.map((dir) => {
        return {
          name: dir.replace(/\.tsx$/, ""),
        };
      }),
    },
  });
}
