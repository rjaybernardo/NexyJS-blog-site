import { Button, Heading, Img, Text } from "@react-email/components";

import { buttonStyle, EmailLayout, headingStyle, MUTED, textStyle } from "./components/layout";

type NewPostProps = {
  appName: string;
  siteUrl: string;
  unsubscribeUrl: string;
  post: {
    title: string;
    excerpt: string;
    url: string;
    coverImage: string | null;
    author: string;
  };
};

export default function NewPost({ appName, siteUrl, unsubscribeUrl, post }: NewPostProps) {
  return (
    <EmailLayout preview={post.excerpt} appName={appName} siteUrl={siteUrl} unsubscribeUrl={unsubscribeUrl}>
      {post.coverImage && (
        <Img
          src={post.coverImage}
          alt=""
          width="520"
          style={{ borderRadius: 6, marginTop: 24, maxWidth: "100%", height: "auto" }}
        />
      )}
      <Heading as="h1" style={headingStyle}>
        {post.title}
      </Heading>
      <Text style={{ color: MUTED, fontSize: 13, margin: "8px 0 0" }}>By {post.author}</Text>
      <Text style={textStyle}>{post.excerpt}</Text>
      <Button href={post.url} style={buttonStyle}>
        Read the post
      </Button>
    </EmailLayout>
  );
}

NewPost.PreviewProps = {
  appName: "The Notebook",
  siteUrl: "http://localhost:3000",
  unsubscribeUrl: "http://localhost:3000/unsubscribe?token=preview",
  post: {
    title: "Why I moved this blog to Next.js 16",
    excerpt: "Server components, server actions and a proxy file made the backend shrink to almost nothing.",
    url: "http://localhost:3000/blog/why-nextjs-16",
    coverImage: null,
    author: "Admin",
  },
} satisfies NewPostProps;
