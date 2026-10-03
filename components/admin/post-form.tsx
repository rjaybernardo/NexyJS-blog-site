"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BoldIcon,
  CodeIcon,
  FileUpIcon,
  Heading2Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  QuoteIcon,
  XIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import Markdown from "@/components/shared/markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPost, updatePost } from "@/lib/actions/post.actions";
import { excerptFrom, parseFrontMatter } from "@/lib/frontmatter";
import { UploadButton } from "@/lib/uploadthing";
import { cn, readingTime, toSlug } from "@/lib/utils";
import { postSchema } from "@/lib/validators";

type PostFormValues = z.infer<typeof postSchema>;

type PostFormProps = {
  tags: { id: string; name: string; slug: string }[];
  post?: PostFormValues & { id: string };
};

const emptyPost: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: null,
  status: "draft",
  featured: false,
  tagIds: [],
};

// Wraps the selection (or inserts a placeholder) with Markdown syntax
const toolbar = [
  { label: "Bold", icon: BoldIcon, before: "**", after: "**", placeholder: "bold text" },
  { label: "Italic", icon: ItalicIcon, before: "_", after: "_", placeholder: "italic text" },
  { label: "Heading", icon: Heading2Icon, before: "\n## ", after: "\n", placeholder: "Heading" },
  { label: "Link", icon: LinkIcon, before: "[", after: "](https://)", placeholder: "link text" },
  { label: "Image", icon: ImageIcon, before: "![", after: "](https://)", placeholder: "alt text" },
  { label: "Quote", icon: QuoteIcon, before: "\n> ", after: "\n", placeholder: "Quote" },
  { label: "List", icon: ListIcon, before: "\n- ", after: "\n", placeholder: "List item" },
  { label: "Code block", icon: CodeIcon, before: "\n```\n", after: "\n```\n", placeholder: "code" },
];

export default function PostForm({ tags, post }: PostFormProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState<string | null>(null);
  // New posts follow the title until the slug is edited by hand
  const [slugTouched, setSlugTouched] = useState(Boolean(post));

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: post ?? emptyPost,
  });

  const [content, coverImage, status] = useWatch({
    control,
    name: ["content", "coverImage", "status"],
  });

  const contentField = register("content");

  const set = (name: keyof PostFormValues, value: PostFormValues[keyof PostFormValues]) =>
    setValue(name, value, { shouldDirty: true, shouldValidate: true });

  const applyFormat = (before: string, after: string, placeholder: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);

    set("content", next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const importMarkdown = async (file: File) => {
    const { data, content: body } = parseFrontMatter(await file.text());
    const str = (value: unknown) => (typeof value === "string" ? value : undefined);

    const title =
      str(data.title) ??
      body.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
      file.name.replace(/\.(md|markdown)$/i, "");

    // Drop a leading "# Title" line, since the title is shown separately
    const markdown = body.replace(/^\s*#\s+.+\r?\n/, "").trim();

    set("title", title);
    set("content", markdown);
    set("excerpt", str(data.excerpt) ?? str(data.description) ?? excerptFrom(markdown));
    set("slug", str(data.slug) ?? toSlug(title));
    setSlugTouched(true);

    const cover = str(data.coverImage) ?? str(data.cover) ?? str(data.image);
    if (cover) set("coverImage", cover);
    if (typeof data.featured === "boolean") set("featured", data.featured);
    if (data.draft === true || data.status === "draft") set("status", "draft");
    if (data.draft === false || data.status === "published") set("status", "published");

    const tagNames = Array.isArray(data.tags)
      ? data.tags
      : typeof data.tags === "string"
        ? data.tags.split(",")
        : [];
    const wanted = new Set(tagNames.map((name) => toSlug(name)));
    const matched = tags.filter((tag) => wanted.has(tag.slug)).map((tag) => tag.id);

    if (matched.length) set("tagIds", matched);

    const missing = tagNames.filter((name) => !tags.some((tag) => tag.slug === toSlug(name)));
    toast.success(`Imported ${file.name}`, {
      description: missing.length
        ? `Tags not found (create them under Tags): ${missing.join(", ")}`
        : undefined,
    });
  };

  const onSubmit = async (values: PostFormValues) => {
    setError(null);

    const result = post ? await updatePost({ ...values, id: post.id }) : await createPost(values);

    if (!result.success) {
      setError(result.message);
      toast.error(result.message);
      return;
    }

    toast.success(result.message);

    if (post) {
      router.refresh();
    } else {
      router.push(`/admin/posts/${result.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_20rem]" noValidate>
      <div className="min-w-0 space-y-6">
        <Card>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.title)}>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  className="text-lg"
                  aria-invalid={Boolean(errors.title)}
                  {...register("title", {
                    onChange: (event) => {
                      if (!slugTouched) set("slug", toSlug(event.target.value));
                    },
                  })}
                />
                <FieldError errors={[errors.title]} />
              </Field>

              <Field data-invalid={Boolean(errors.slug)}>
                <FieldLabel htmlFor="slug">Slug</FieldLabel>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center rounded-md border bg-muted/40 pl-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring/50">
                    /blog/
                    <Input
                      id="slug"
                      className="border-0 bg-transparent pl-0.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
                      aria-invalid={Boolean(errors.slug)}
                      {...register("slug", { onChange: () => setSlugTouched(true) })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => set("slug", toSlug(getValues("title")))}
                  >
                    From title
                  </Button>
                </div>
                <FieldError errors={[errors.slug]} />
              </Field>

              <Field data-invalid={Boolean(errors.excerpt)}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="excerpt">Excerpt</FieldLabel>
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={() => set("excerpt", excerptFrom(getValues("content")))}
                  >
                    Generate from content
                  </Button>
                </div>
                <Textarea id="excerpt" rows={2} aria-invalid={Boolean(errors.excerpt)} {...register("excerpt")} />
                <FieldDescription>Shown on post cards and in search results.</FieldDescription>
                <FieldError errors={[errors.excerpt]} />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b p-2">
            <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Editor mode">
              {(["write", "preview"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={tab === mode}
                  onClick={() => setTab(mode)}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm capitalize transition-colors",
                    tab === mode ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {tab === "write" && (
              <div className="flex flex-wrap items-center gap-0.5">
                {toolbar.map(({ label, icon: Icon, before, after, placeholder }) => (
                  <Button
                    key={label}
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={label}
                    title={label}
                    onClick={() => applyFormat(before, after, placeholder)}
                  >
                    <Icon />
                  </Button>
                ))}
              </div>
            )}

            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <FileUpIcon /> Import .md
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".md,.markdown,text/markdown"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void importMarkdown(file);
                event.target.value = "";
              }}
            />
          </div>

          <div className={cn(tab !== "write" && "hidden")}>
            <Label htmlFor="content" className="sr-only">
              Content (Markdown)
            </Label>
            <Textarea
              id="content"
              rows={24}
              placeholder={"Write your post in Markdown...\n\n## A heading\n\nSome **bold** text and a [link](https://example.com)."}
              className="min-h-[32rem] resize-y rounded-none border-0 font-mono text-sm leading-6 shadow-none focus-visible:ring-0 dark:bg-transparent"
              aria-invalid={Boolean(errors.content)}
              {...contentField}
              ref={(element) => {
                contentField.ref(element);
                contentRef.current = element;
              }}
            />
          </div>

          {tab === "preview" && (
            <div className="min-h-[32rem] px-6 pb-10 text-base">
              {content?.trim() ? (
                <Markdown>{content}</Markdown>
              ) : (
                <p className="pt-6 text-muted-foreground">Nothing to preview yet.</p>
              )}
            </div>
          )}

          <div className="flex justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <span>Markdown with GitHub extensions (tables, task lists, code blocks)</span>
            <span>
              {content?.trim().split(/\s+/).filter(Boolean).length ?? 0} words · {readingTime(content ?? "")} min read
            </span>
          </div>
        </Card>
        {errors.content && <FieldError errors={[errors.content]} />}
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1" role="radiogroup" aria-label="Status">
              {(["draft", "published"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={status === value}
                  onClick={() => set("status", value)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm capitalize transition-colors",
                    status === value ? "bg-background font-medium shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {value}
                </button>
              ))}
            </div>

            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <Checkbox
                    id="featured"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                  <FieldLabel htmlFor="featured" className="font-normal">
                    Feature on the home page
                  </FieldLabel>
                </Field>
              )}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : post
                  ? status === "published"
                    ? "Save & publish"
                    : "Save draft"
                  : status === "published"
                    ? "Publish post"
                    : "Create draft"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cover image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {coverImage ? (
              <div className="relative overflow-hidden rounded-lg border">
                {/* Any host is allowed here, so a plain img */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Cover preview" className="aspect-[16/10] w-full object-cover" />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  className="absolute right-2 top-2"
                  aria-label="Remove cover image"
                  onClick={() => set("coverImage", null)}
                >
                  <XIcon />
                </Button>
              </div>
            ) : (
              <div className="upload-field flex aspect-[16/10] items-center justify-center rounded-lg border border-dashed bg-muted/40">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(files) => {
                    const url = files[0]?.ufsUrl;
                    if (url) set("coverImage", url);
                  }}
                  onUploadError={(uploadError) => {
                    toast.error(uploadError.message);
                  }}
                />
              </div>
            )}
            <Input
              placeholder="or paste an image URL"
              aria-label="Cover image URL"
              value={coverImage ?? ""}
              onChange={(event) => set("coverImage", event.target.value.trim() || null)}
            />
            <FieldError errors={[errors.coverImage]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tags yet. Add some under Tags.</p>
            ) : (
              <Controller
                control={control}
                name="tagIds"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => {
                      const selected = field.value.includes(tag.id);

                      return (
                        <button
                          key={tag.id}
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            field.onChange(
                              selected ? field.value.filter((id) => id !== tag.id) : [...field.value, tag.id],
                            )
                          }
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-sm transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
