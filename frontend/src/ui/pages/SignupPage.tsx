import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Leaf, Lock, Mail, User } from 'lucide-react';
import { ROUTES } from '@/router/routes.consts';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { useSignupMutation } from '@/store/apis/users.api';
import { AuthCardHeader, AuthPageLayout } from '@/ui/components';
import { isValidEmailFormat, validatePasswordStrength } from '@/utils/authValidation';

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [signup, { isLoading }] = useSignupMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setError('Please provide your full name.');
      return;
    }

    if (!isValidEmailFormat(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const passwordPolicyError = validatePasswordStrength(password);
    if (passwordPolicyError) {
      setError(passwordPolicyError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await signup({ name: trimmedName, email: normalizedEmail, password }).unwrap();
      setError('');
      setSuccessMessage(response.message);
      navigate(`${ROUTES.login}?email=${encodeURIComponent(normalizedEmail)}`, { replace: true });
    } catch {
      setSuccessMessage('');
      setError('Could not create account. Check your input and try again.');
    }
  }

  return (
    <AuthPageLayout
      reverseDesktopOrder
      card={
        <section className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-2xl shadow-sky-900/10 backdrop-blur md:p-8 lg:order-1">
          <AuthCardHeader
            title="Create account"
            iconClassName="bg-slate-900 text-slate-50"
            labelClassName="text-slate-700"
            titleClassName="text-slate-950"
          />

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-950">Full name</span>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-700/55" />
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="border-slate-900/20 bg-white pl-9"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-950">Email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-700/55" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="border-slate-900/20 bg-white pl-9"
                />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-950">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-700/55" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 12 chars, with upper/lower/number/symbol"
                  className="border-slate-900/20 bg-white pr-10 pl-9"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-700/70 transition hover:text-slate-900"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-950">Confirm password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-700/55" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat your password"
                  className="border-slate-900/20 bg-white pr-10 pl-9"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-700/70 transition hover:text-slate-900"
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <p className="text-xs text-slate-600">
              Password must be at least 12 characters and include uppercase, lowercase, number, and symbol.
            </p>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {successMessage ? <p className="text-sm text-emerald-700">{successMessage}</p> : null}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-slate-900 text-slate-50 hover:bg-slate-800"
            >
              Create account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-700">
            Already have an account?{' '}
            <Link className="font-semibold text-slate-950 underline underline-offset-4" to={ROUTES.login}>
              Sign in
            </Link>
          </p>
        </section>
      }
      hero={
        <section className="hidden space-y-6 lg:order-2 lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-700/20 bg-white/60 px-4 py-1 text-sm text-sky-900 backdrop-blur">
            <Leaf className="size-4" />
            Personalize every watering cycle
          </div>
          <h1 className="max-w-xl text-5xl leading-tight font-semibold tracking-tight text-slate-950">
            Build your irrigation profile in under a minute.
          </h1>
          <p className="max-w-xl text-lg text-slate-800/80">
            Add gardens, configure lines, and automate smarter watering from day one.
          </p>
        </section>
      }
    />
  );
}