import type { Metadata } from "next";

import PageHeader from "@/components/admin/page-header";
import PostForm from "@/components/admin/post-form";
import { getAllTags } from "@/lib/queries/admin";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  const tags = await getAllTags();

  return (
    <>
      <PageHeader title="New post" description="Write in Markdown, or import a .md file." />
      <PostForm tags={tags} />
    </>
  );
}
