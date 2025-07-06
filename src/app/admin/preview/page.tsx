import Test from "@/components/elements/test";
import RenderServerElements from "@/components/LayoutBuilder/RenderServerElements";
import { NextPageSearchParams } from "@/components/LayoutBuilder/types";
import LayoutPreivew from "@/components/pages/LayoutPreivew";

const Page = ({
  searchParams,
}: {
  params: { slug: string };
  searchParams: NextPageSearchParams;
}) => {
  return (
    <div>
      <LayoutPreivew>
        <RenderServerElements searchParams={searchParams} />;
      </LayoutPreivew>
    </div>
  );
};

export default Page;
