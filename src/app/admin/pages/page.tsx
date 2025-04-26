import { getPages } from "@/app/services/pages";
import CreatePageForm from "@/components/pages/CreatePageForm";
import Link from "next/link";
import React from "react";

const allPages = async () => {
  const pages = await getPages();

  return (
    <div>
      {pages.length === 0 && <div>No pages found</div>}
      <div className="py-4 flex flex-col gap-4">
        {pages.map((page) => (
          <Link
            key={page.id}
            className="p-5 border-2 rounded-sm cursor-pointer block hover:bg-gray-100 transition-all"
            href={`/admin?page=${page.slug}`}
          >
            {page.name}
          </Link>
        ))}
      </div>

      <CreatePageForm />
    </div>
  );
};

export default allPages;
