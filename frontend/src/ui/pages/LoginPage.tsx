import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, Leaf, Lock, Mail } from 'lucide-react';
import { ROUTES } from '@/router/routes.consts';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { useLoginMutation, useResendVerificationMutation } from '@/store/apis/users.api';
import { setCredentials } from '@/store/slices/user.slice';
import { useAppDispatch } from '@/hooks';
import { AuthCardHeader, AuthPageLayout } from '@/ui/components';
import { isValidEmailFormat } from '@/utils/authValidation';

type ApiError = {
  data?: {
    code?: string;
    message?: string;
  };
};

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();
  const [resendVerification, { isLoading: isResendingVerification }] = useResendVerificationMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmailFormat(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await login({ email: normalizedEmail, password }).unwrap();
      dispatch(setCredentials(response));
      navigate(ROUTES.home, { replace: true });
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      const code = apiError.data?.code;
      const message = apiError.data?.message;

      if (code === 'EMAIL_NOT_VERIFIED') {
        setPendingVerificationEmail(normalizedEmail);
        setError(message ?? 'Please verify your email before signing in.');
        return;
      }

      setError(message ?? 'Invalid email or password.');
    }
  }

  async function handleResendVerification() {
    const normalizedEmail = (pendingVerificationEmail ?? email).trim().toLowerCase();

    if (!isValidEmailFormat(normalizedEmail)) {
      setError('Provide a valid email address to resend verification.');
      return;
    }

    try {
      const response = await resendVerification({ email: normalizedEmail }).unwrap();
      setInfo(response.message);
      setError('');
    } catch {
      setInfo('');
      setError('Could not resend verification email right now.');
    }
  }

  return (
    <AuthPageLayout
      hero={
        <section className="hidden space-y-6 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-white/60 px-4 py-1 text-sm text-emerald-900 backdrop-blur">
            <Leaf className="size-4" />
            Smart irrigation starts here
          </div>
          <h1 className="max-w-xl text-5xl leading-tight font-semibold tracking-tight text-emerald-950">
            Welcome back to your garden control center.
          </h1>
          <p className="max-w-xl text-lg text-emerald-900/80">
            Track your irrigation lines, monitor layouts, and keep every drop intentional.
          </p>
        </section>
      }
      card={
        <section className="rounded-3xl border border-emerald-900/10 bg-white/80 p-6 shadow-2xl shadow-emerald-900/10 backdrop-blur md:p-8">
          <AuthCardHeader
            title="Sign in"
            iconClassName="bg-emerald-900 text-emerald-50"
            labelClassName="text-emerald-900/70"
            titleClassName="text-emerald-950"
          />

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-emerald-950">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-emerald-900/50" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="border-emerald-900/20 bg-white pl-9"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-emerald-950">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-emerald-900/50" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Your password"
                  className="border-emerald-900/20 bg-white pr-10 pl-9"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-emerald-900/60 transition hover:text-emerald-900"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {info ? <p className="text-sm text-emerald-700">{info}</p> : null}

            {pendingVerificationEmail ? (
              <Button
                type="button"
                variant="outline"
                disabled={isResendingVerification}
                className="h-10 w-full"
                onClick={() => void handleResendVerification()}
              >
                Resend verification email
              </Button>
            ) : null}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-slate-900 text-slate-50 hover:bg-slate-800"
            >
              Continue
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-emerald-900/75">
            New here?{' '}
            <Link className="font-semibold text-emerald-950 underline underline-offset-4" to={ROUTES.signup}>
              Join our beta run
            </Link>
          </p>
        </section>
      }
    />
  );
}