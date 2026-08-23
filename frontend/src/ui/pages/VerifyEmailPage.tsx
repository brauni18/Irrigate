import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, MailWarning } from 'lucide-react';
import { ROUTES } from '@/router/routes.consts';
import { Button } from '@/shadcn/components/ui/button';
import { isValidEmailFormat } from '@/utils/authValidation';
import { useResendVerificationMutation, useVerifyEmailMutation } from '@/store/apis/users.api';
import { AuthPageLayout } from '@/ui/components';
import { AuthCardHeader } from '../components/AuthCardHeader.tsx';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState('Verifying your email...');
  const [errorMessage, setErrorMessage] = useState('');

  const email = useMemo(() => (searchParams.get('email') ?? '').trim().toLowerCase(), [searchParams]);
  const token = useMemo(() => (searchParams.get('token') ?? '').trim(), [searchParams]);

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  useEffect(() => {
    if (!email || !token || !isValidEmailFormat(email)) {
      setStatusMessage('');
      setErrorMessage('Verification link is invalid. Please request a new verification email.');
      return;
    }

    void (async () => {
      try {
        const result = await verifyEmail({ email, token }).unwrap();
        setStatusMessage(result.message);
        setErrorMessage('');
      } catch {
        setStatusMessage('');
        setErrorMessage('Verification link is invalid or expired. Request a new one below.');
      }
    })();
  }, [email, token, verifyEmail]);

  async function handleResend() {
    if (!isValidEmailFormat(email)) {
      setErrorMessage('Provide a valid email to resend verification.');
      return;
    }

    try {
      const result = await resendVerification({ email }).unwrap();
      setErrorMessage('');
      setStatusMessage(result.message);
    } catch {
      setErrorMessage('Could not resend verification email right now.');
    }
  }

  return (
    <AuthPageLayout
      compact
      card={
        <section className="w-full rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-2xl shadow-sky-900/10 backdrop-blur md:p-8">
          <AuthCardHeader
            title="Verify email"
            iconClassName="bg-slate-900 text-slate-50"
            labelClassName="text-slate-700"
            titleClassName="text-slate-950"
          />

          {statusMessage ? (
            <p className="mb-4 flex items-start gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{statusMessage}</span>
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mb-4 flex items-start gap-2 text-sm text-red-600">
              <MailWarning className="mt-0.5 size-4 shrink-0" />
              <span>{errorMessage}</span>
            </p>
          ) : null}

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isResending || !email || !isValidEmailFormat(email)}
              onClick={() => void handleResend()}
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </Button>

            <Button asChild className="h-11 w-full rounded-xl bg-slate-900 text-slate-50 hover:bg-slate-800">
              <Link to={`${ROUTES.login}${email ? `?email=${encodeURIComponent(email)}` : ''}`}>
                Back to sign in
              </Link>
            </Button>
          </div>

          {isVerifying ? <p className="mt-4 text-center text-xs text-slate-500">Checking verification token...</p> : null}
        </section>
      }
    />
  );
}