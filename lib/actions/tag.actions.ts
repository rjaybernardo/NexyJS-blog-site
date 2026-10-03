"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { assertAdmin } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { toSlug } from "@/lib/utils";
import { formatError } from "@/lib/utils/server";
import { tagSchema } from "@/lib/validators";

export async function createTag(_prevState: unknown, formData: FormData) {
  try {
    await assertAdmin();
    const { name } = tagSchema.parse({ name: formData.get("name") });

    const slug = toSlug(name);
    if (!slug) throw new Error("Tag needs at least one letter or number");

    await prisma.tag.create({ data: { name, slug } });

    revalidatePath("/", "layout");

    return { success: true, message: `Tag "${name}" added` };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteTag(id: string) {
  try {
    await assertAdmin();

    // Posts keep existing; only the tag link is removed
    await prisma.tag.delete({ where: { id: z.uuid().parse(id) } });

    revalidatePath("/", "layout");

    return { success: true, message: "Tag deleted" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
