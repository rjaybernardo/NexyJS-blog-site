import { Button, Heading, Text } from "@react-email/components";

import { buttonStyle, EmailLayout, headingStyle, textStyle } from "./components/layout";

type WelcomeSubscriberProps = {
  appName: string;
  siteUrl: string;
  unsubscribeUrl: string;
};

export default function WelcomeSubscriber({ appName, siteUrl, unsubscribeUrl }: WelcomeSubscriberProps) {
  return (
    <EmailLayout
      preview={`You're subscribed to ${appName}`}
      appName={appName}
      siteUrl={siteUrl}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading as="h1" style={headingStyle}>
        Thanks for subscribing
      </Heading>
      <Text style={textStyle}>
        You&apos;ll get an email whenever a new post goes up on {appName}. Nothing else, and you can
        unsubscribe with one click from any email.
      </Text>
      <Button href={siteUrl} style={buttonStyle}>
        Read the latest posts
      </Button>
    </EmailLayout>
  );
}

WelcomeSubscriber.PreviewProps = {
  appName: "The Notebook",
  siteUrl: "http://localhost:3000",
  unsubscribeUrl: "http://localhost:3000/unsubscribe?token=preview",
} satisfies WelcomeSubscriberProps;
