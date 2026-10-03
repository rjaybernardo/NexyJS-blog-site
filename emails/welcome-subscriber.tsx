import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

type WelcomeSubscriberProps = {
  appName: string;
  siteUrl: string;
};

export default function WelcomeSubscriber({
  appName,
  siteUrl,
}: WelcomeSubscriberProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>You&apos;re subscribed to {appName}</Preview>
      <Body style={{ backgroundColor: "#ecebe6", fontFamily: "sans-serif" }}>
        <Container
          style={{
            backgroundColor: "#f6f5f1",
            border: "1px solid #dcdad5",
            borderRadius: 8,
            margin: "40px auto",
            maxWidth: 480,
            padding: 32,
          }}
        >
          <Heading as="h1" style={{ fontSize: 22, margin: 0 }}>
            Thanks for subscribing
          </Heading>
          <Text style={{ color: "#161616", fontSize: 15, lineHeight: "24px" }}>
            You&apos;ll get an email when a new post goes up on {appName}. No
            spam, and you can reply to this email any time.
          </Text>
          <Link href={siteUrl} style={{ color: "#161616", fontWeight: 600 }}>
            Read the latest posts →
          </Link>
          <Hr style={{ borderColor: "#dcdad5", margin: "24px 0" }} />
          <Text style={{ color: "#7a7975", fontSize: 12, margin: 0 }}>
            {appName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeSubscriber.PreviewProps = {
  appName: "The Notebook",
  siteUrl: "http://localhost:3000",
} satisfies WelcomeSubscriberProps;
