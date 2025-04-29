import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { promises as fs } from "fs";
import { z } from "zod";

const postSchema = z.object({
  filename: z.string(),
  data: z.any(),
  componentName: z.string(),
});
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = postSchema.parse(json);

    const { filename, data, componentName } = body;
    const validatorModule = await import(
      "@/components/serverElements/validators/" + componentName
    );

    const validator = validatorModule.default as z.Schema;
    const pureData = validator.parse(data);
    if (!filename || !data) {
      return new NextResponse("Missing filename or data", { status: 400 });
    }

    const filePath = join(process.cwd(), "uploads", `${filename}.json`);

    await writeFile(filePath, JSON.stringify(pureData, null, 2), "utf-8");

    return NextResponse.json({ message: "File saved!" });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error,
        },
        {
          status: 400,
        }
      );
    }
    return new NextResponse("Failed to save file", { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  try {
    const filePath = join(process.cwd(), "uploads", `${filename}.json`);
    const fileContent = await fs.readFile(filePath, "utf-8");

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("File not found", { status: 404 });
  }
}
