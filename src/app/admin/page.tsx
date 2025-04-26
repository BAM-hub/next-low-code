import LayoutBuilder from "@/components/LayoutBuilder";
import RenderServerElements from "@/components/LayoutBuilder/RenderServerElements";
import { NextPageSearchParams } from "@/components/LayoutBuilder/types";

const Page = ({
  searchParams,
}: {
  params: { slug: string };
  searchParams: NextPageSearchParams;
}) => {
  return (
    <div>
      <LayoutBuilder>
        <RenderServerElements searchParams={searchParams} />
      </LayoutBuilder>
    </div>
  );
};

export default Page;
