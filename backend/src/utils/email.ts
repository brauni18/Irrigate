import nodemailer from 'nodemailer';

type VerificationEmailParams = {
  to: string;
  name: string;
  email: string;
  token: string;
};

type FeedbackEmailParams = {
  submittedByName: string;
  submittedByEmail: string;
  type: 'bug' | 'feature' | 'general';
  message: string;
  pagePath: string;
};

function resolveFrontendBaseUrl() {
  return process.env.FRONTEND_URL ?? process.env.frontendUrl ?? 'http://localhost:5173';
}

function resolveVerifyUrl(email: string, token: string) {
  const params = new URLSearchParams({ email, token });
  return `${resolveFrontendBaseUrl()}/verify-email?${params.toString()}`;
}

async function sendViaSmtp(to: string, subject: string, text: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !user || !pass || !from) return false;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });

  return true;
}

export async function sendVerificationEmail(params: VerificationEmailParams): Promise<void> {
  const verifyUrl = resolveVerifyUrl(params.email, params.token);
  const subject = 'Verify your Irrigate account';
  const text = [
    `Hi ${params.name},`,
    '',
    'Please verify your email address to activate your account.',
    `Verification link: ${verifyUrl}`,
    '',
    'If you did not create this account, you can ignore this email.',
  ].join('\n');

  const sent = await sendViaSmtp(params.to, subject, text);

  if (!sent) {
    console.log(`ℹ️ SMTP is not configured. Verification link for ${params.to}: ${verifyUrl}`);
  }
}

export async function sendFeedbackEmail(params: FeedbackEmailParams): Promise<void> {
  const to = process.env.FEEDBACK_TO;

  if (!to) {
    console.log(
      `ℹ️ FEEDBACK_TO is not configured. Feedback from ${params.submittedByEmail} on ${params.pagePath}: ${params.message}`,
    );
    return;
  }

  const subject = `Irrigate feedback: ${params.type}`;
  const text = [
    `Submitted by: ${params.submittedByName} <${params.submittedByEmail}>`,
    `Type: ${params.type}`,
    `Page: ${params.pagePath}`,
    '',
    params.message,
  ].join('\n');

  const sent = await sendViaSmtp(to, subject, text);

  if (!sent) {
    console.log(
      `ℹ️ SMTP is not configured. Feedback from ${params.submittedByEmail} on ${params.pagePath}: ${params.message}`,
    );
  }
}