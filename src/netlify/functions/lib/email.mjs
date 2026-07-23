import { render, toPlainText } from '@react-email/render';
import { ContactNotificationEmail } from '../../emails/contact-notification.tsx';

// ContactNotificationEmail has no hooks/state, so calling it directly (rather
// than via JSX) returns the same element tree without requiring JSX syntax
// in this plain .mjs module.
export async function renderContactEmail(props) {
  const html = await render(ContactNotificationEmail(props));
  const text = toPlainText(html);
  return { html, text };
}
