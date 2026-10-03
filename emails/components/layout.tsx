import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

// The site's two tones; email clients don't support CSS variables
export const INK = "#161616";
export const PAPER = "#f6f5f1";
export const MUTED = "#7a7975";
export const LINE = "#dcdad5";

type EmailLayoutProps = {
  preview: string;
  appName: string;
  siteUrl: string;
  // Shown in the footer of newsletter emails
  unsubscribeUrl?: string;
  children: React.ReactNode;
};

export function EmailLayout({ preview, appName, siteUrl, unsubscribeUrl, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#ecebe6", fontFamily: "Helvetica, Arial, sans-serif", margin: 0 }}>
        <Container
          style={{
            backgroundColor: PAPER,
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            margin: "40px auto",
            maxWidth: 520,
            padding: 32,
          }}
        >
          <Link href={siteUrl} style={{ color: INK, fontFamily: "Georgia, serif", fontSize: 18, textDecoration: "none" }}>
            {appName}
          </Link>
          {children}
          <Hr style={{ borderColor: LINE, margin: "28px 0 16px" }} />
          <Text style={{ color: MUTED, fontSize: 12, lineHeight: "18px", margin: 0 }}>
            {unsubscribeUrl ? (
              <>
                You&apos;re getting this because you subscribed to {appName}.{" "}
                <Link href={unsubscribeUrl} style={{ color: MUTED, textDecoration: "underline" }}>
                  Unsubscribe
                </Link>
              </>
            ) : (
              appName
            )}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const headingStyle = {
  color: INK,
  fontFamily: "Georgia, serif",
  fontSize: 26,
  fontWeight: 400,
  lineHeight: "32px",
  margin: "24px 0 0",
};

export const textStyle = { color: INK, fontSize: 15, lineHeight: "24px" };

export const buttonStyle = {
  backgroundColor: INK,
  borderRadius: 6,
  color: PAPER,
  display: "inline-block",
  fontSize: 14,
  fontWeight: 600,
  padding: "10px 18px",
  textDecoration: "none",
};
