import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export interface ContactNotificationEmailProps {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  pageUrl: string;
  userAgent: string;
  recaptchaScore?: number;
}

export function ContactNotificationEmail({
  email,
  message,
  name,
  pageUrl,
  recaptchaScore,
  submittedAt,
  userAgent,
}: ContactNotificationEmailProps) {
  return (
    <Html lang="de">
      <Head />
      <Preview>Neue Kontaktnachricht von {name}</Preview>
      <Body style={{ backgroundColor: '#f4f4f5', fontFamily: 'sans-serif' }}>
        <Container
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            margin: '32px auto',
            maxWidth: '576px',
            padding: '32px',
          }}
        >
          <Heading style={{ fontSize: '20px', margin: 0 }}>
            Neue Kontaktnachricht
          </Heading>

          <Section style={{ marginTop: '24px' }}>
            <Text
              style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 4px' }}
            >
              NAME
            </Text>
            <Text style={{ fontSize: '16px', margin: '0 0 16px' }}>{name}</Text>

            <Text
              style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 4px' }}
            >
              EMAIL
            </Text>
            <Text style={{ fontSize: '16px', margin: '0 0 16px' }}>
              <Link href={`mailto:${email}`}>{email}</Link>
            </Text>

            <Text
              style={{ fontSize: '12px', fontWeight: 600, margin: '0 0 4px' }}
            >
              NACHRICHT
            </Text>
            <Text style={{ fontSize: '16px', margin: 0 }}>
              {message
                .split('\n')
                .flatMap((line, index) =>
                  index === 0 ? [line] : [<br key={index} />, line],
                )}
            </Text>
          </Section>

          <Hr style={{ margin: '24px 0' }} />

          <Section>
            <Text style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
              Gesendet {submittedAt}
            </Text>
            <Text style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
              Von <Link href={pageUrl}>{pageUrl}</Link>
            </Text>
            <Text style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
              User agent: {userAgent}
            </Text>
            {typeof recaptchaScore === 'number' && (
              <Text style={{ color: '#71717a', fontSize: '12px', margin: 0 }}>
                reCAPTCHA-Score: {recaptchaScore}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// react-email's CLI and Resend both expect the default export.
export default ContactNotificationEmail;

ContactNotificationEmail.PreviewProps = {
  email: 'gast@example.com',
  message:
    'Hallo, ich wollte fragen ob ihr auch Empfehlungen für Restaurants in Bophut habt.',
  name: 'Max Mustermann',
  pageUrl: 'https://samui-samui.de/kontakt/',
  recaptchaScore: 0.9,
  submittedAt: '17 July 2026, 14:20 ICT',
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
} satisfies ContactNotificationEmailProps;
