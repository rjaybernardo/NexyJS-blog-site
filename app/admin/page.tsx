import type { Metadata } from "next";
import Link from "next/link";
import {
  EyeIcon,
  FileTextIcon,
  MailIcon,
  MessageSquareIcon,
  PencilLineIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react";

import PageHeader from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/queries/admin";
import { formatDate, formatNumber } from "@/lib/utils";

import ActivityChart from "./activity-chart";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const stats = await getDashboardStats();

  const tiles = [
    { label: "Published posts", value: stats.publishedCount, icon: FileTextIcon, href: "/admin/posts?status=published" },
    { label: "Drafts", value: stats.draftCount, icon: PencilLineIcon, href: "/admin/posts?status=draft" },
    { label: "Total views", value: stats.totalViews, icon: EyeIcon, href: "/admin/posts" },
    { label: "Comments", value: stats.commentCount, icon: MessageSquareIcon, href: "/admin/comments" },
    { label: "Users", value: stats.userCount, icon: UsersIcon, href: "/admin/users" },
    { label: "Subscribers", value: stats.subscriberCount, icon: MailIcon, href: "/admin/subscribers" },
  ];

  return (
    <>
      <PageHeader title="Overview" description="How the blog is doing.">
        <Link href="/admin/posts/new" className={buttonVariants()}>
          <PlusIcon /> New post
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="group">
            <Card className="h-full transition-colors group-hover:border-foreground/20">
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {label}
                  <Icon className="size-4" />
                </div>
                <p className="text-3xl font-semibold tabular-nums tracking-tight">{formatNumber(value)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Posts published and comments, last six months</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={stats.activity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most read</CardTitle>
            <CardDescription>Published posts by views</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topPosts.length > 0 ? (
              <ol className="space-y-3">
                {stats.topPosts.map((post, index) => (
                  <li key={post.id} className="flex items-center gap-3 text-sm">
                    <span className="w-4 text-muted-foreground tabular-nums">{index + 1}</span>
                    <Link href={`/admin/posts/${post.id}`} className="min-w-0 flex-1 truncate hover:underline">
                      {post.title}
                    </Link>
                    <span className="tabular-nums text-muted-foreground">{formatNumber(post.views)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing published yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recently edited</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {stats.recentPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <Link href={`/admin/posts/${post.id}`} className="min-w-0 flex-1 truncate hover:underline">
                    {post.title}
                  </Link>
                  <Badge variant={post.status === "published" ? "default" : "secondary"}>{post.status}</Badge>
                  <span className="w-24 text-right text-muted-foreground">{formatDate(post.updatedAt)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest comments</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentComments.length > 0 ? (
              <ul className="divide-y">
                {stats.recentComments.map((comment) => (
                  <li key={comment.id} className="space-y-1 py-2.5 text-sm">
                    <p className="line-clamp-2">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {comment.user.name} on{" "}
                      <Link href={`/blog/${comment.post.slug}`} className="underline underline-offset-2">
                        {comment.post.title}
                      </Link>{" "}
                      · {formatDate(comment.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
