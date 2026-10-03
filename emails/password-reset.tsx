import { Button, Heading, Text } from "@react-email/components";

import { buttonStyle, EmailLayout, headingStyle, MUTED, textStyle } from "./components/layout";

type PasswordResetProps = {
  appName: string;
  siteUrl: string;
  resetUrl: string;
};

export default function PasswordReset({ appName, siteUrl, resetUrl }: PasswordResetProps) {
  return (
    <EmailLayout preview={`Reset your ${appName} password`} appName={appName} siteUrl={siteUrl}>
      <Heading as="h1" style={headingStyle}>
        Reset your password
      </Heading>
      <Text style={textStyle}>
        Someone asked to reset the password for your account. Use the button below to choose a new
        one. The link works once and expires in one hour.
      </Text>
      <Button href={resetUrl} style={buttonStyle}>
        Choose a new password
      </Button>
      <Text style={{ color: MUTED, fontSize: 13, lineHeight: "20px", marginTop: 24 }}>
        If you didn&apos;t ask for this, ignore this email. Your password won&apos;t change.
      </Text>
    </EmailLayout>
  );
}

PasswordReset.PreviewProps = {
  appName: "The Notebook",
  siteUrl: "http://localhost:3000",
  resetUrl: "http://localhost:3000/reset-password?token=preview",
} satisfies PasswordResetProps;
