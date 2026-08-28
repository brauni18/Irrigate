import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Leaf, Lock, Mail, User } from 'lucide-react';
import { ROUTES } from '@/router/routes.consts';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Select } from '@/shadcn/components/ui/select';
import { useSignupMutation } from '@/store/apis/users.api';
import { AuthCardHeader, AuthPageLayout } from '@/ui/components';
import { isValidEmailFormat, validatePasswordStrength } from '@/utils/authValidation';

type ApiError = {
  data?: {
    message?: string;
  };
};

const PROFESSION_OPTIONS = [
  { value: 'gardener', label: 'Gardener' },
  { value: 'landscape-architect', label: 'Landscape architect' },
  { value: 'architect', label: 'Architect' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'other', label: 'Other' },
] as const;

const BUSINESS_MODEL_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'construction', label: 'Construction' },
  { value: 'maintenance', label: 'Maintaining' },
  { value: 'other', label: 'Other' },
] as const;

const SECTOR_OPTIONS = [
  { value: 'private', label: 'Private' },
  { value: 'public', label: 'Public' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
] as const;

function toggleMultiSelectOption(values: string[], value: string, checked: boolean) {
  if (checked) {
    return values.includes(value) ? values : [...values, value];
  }

  return values.filter((item) => item !== value);
}

function getSelectionSummary(values: string[], options: readonly { value: string; label: string }[]) {
  if (!values.length) {
    return 'Select one or more';
  }

  const labels = options.filter((option) => values.includes(option.value)).map((option) => option.label);
  return labels.join(', ');
}

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [professionOther, setProfessionOther] = useState('');
  const [businessModels, setBusinessModels] = useState<string[]>([]);
  const [businessModelOther, setBusinessModelOther] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [sectorOther, setSectorOther] = useState('');
  const [betaConsent, setBetaConsent] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [signup, { isLoading }] = useSignupMutation();
  const selectedProfessionIsOther = profession === 'other';
  const businessModelIncludesOther = businessModels.includes('other');
  const sectorIncludesOther = sectors.includes('other');

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

    if (!profession) {
      setError('Please select your profession.');
      return;
    }

    if (selectedProfessionIsOther && !professionOther.trim()) {
      setError('Please tell us your profession.');
      return;
    }

    if (!businessModels.length) {
      setError('Please select at least one business model.');
      return;
    }

    if (businessModelIncludesOther && !businessModelOther.trim()) {
      setError('Please tell us your business model.');
      return;
    }

    if (!sectors.length) {
      setError('Please select at least one sector.');
      return;
    }

    if (sectorIncludesOther && !sectorOther.trim()) {
      setError('Please tell us which sector you work in.');
      return;
    }

    if (!betaConsent) {
      setError('Please confirm that you agree to join beta testing and data usage for improvement.');
      return;
    }

    const normalizedProfessionOther = professionOther.trim();
    const normalizedBusinessModelOther = businessModelOther.trim();
    const normalizedSectorOther = sectorOther.trim();

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
      await signup({
        name: trimmedName,
        email: normalizedEmail,
        password,
        profession,
        professionOther: selectedProfessionIsOther ? normalizedProfessionOther : undefined,
        businessModels,
        businessModelOther: businessModelIncludesOther ? normalizedBusinessModelOther : undefined,
        sectors,
        sectorOther: sectorIncludesOther ? normalizedSectorOther : undefined,
        betaConsent,
      }).unwrap();
      setError('');
      navigate(ROUTES.signupSuccess, { replace: true });
    } catch (caughtError) {
      const apiError = caughtError as ApiError;
      setError(apiError.data?.message ?? 'Could not create account. Check your input and try again.');
    }
  }

  return (
    <AuthPageLayout
      reverseDesktopOrder
      card={
        <section className="rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-2xl shadow-sky-900/10 backdrop-blur md:p-8 lg:order-1">
          <AuthCardHeader
            title="Join our beta run"
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

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-950">Profession</legend>
              <Select
                value={profession}
                onChange={(event) => setProfession(event.target.value)}
                className="border-slate-900/20 bg-white"
              >
                <option value="">Select your profession</option>
                {PROFESSION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {selectedProfessionIsOther ? (
                <Input
                  type="text"
                  value={professionOther}
                  onChange={(event) => setProfessionOther(event.target.value)}
                  placeholder="Please specify"
                  className="border-slate-900/20 bg-white"
                />
              ) : null}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-950">Business model (multi choice)</legend>
              <details className="rounded-xl border border-slate-900/20 bg-white px-3 py-2">
                <summary className="cursor-pointer list-none text-sm text-slate-700">
                  {getSelectionSummary(businessModels, BUSINESS_MODEL_OPTIONS)}
                </summary>
                <div className="mt-3 grid gap-2 border-t border-slate-900/10 pt-3 sm:grid-cols-2">
                  {BUSINESS_MODEL_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-900">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={businessModels.includes(option.value)}
                        onChange={(event) => {
                          setBusinessModels((prev) =>
                            toggleMultiSelectOption(prev, option.value, event.target.checked),
                          );
                        }}
                        className="h-4 w-4 accent-slate-900"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </details>
              {businessModelIncludesOther ? (
                <Input
                  type="text"
                  value={businessModelOther}
                  onChange={(event) => setBusinessModelOther(event.target.value)}
                  placeholder="Please specify"
                  className="border-slate-900/20 bg-white"
                />
              ) : null}
            </fieldset>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-950">What sector are you working in? (multi choice)</legend>
              <details className="rounded-xl border border-slate-900/20 bg-white px-3 py-2">
                <summary className="cursor-pointer list-none text-sm text-slate-700">
                  {getSelectionSummary(sectors, SECTOR_OPTIONS)}
                </summary>
                <div className="mt-3 grid gap-2 border-t border-slate-900/10 pt-3 sm:grid-cols-2">
                  {SECTOR_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-slate-900">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={sectors.includes(option.value)}
                        onChange={(event) => {
                          setSectors((prev) => toggleMultiSelectOption(prev, option.value, event.target.checked));
                        }}
                        className="h-4 w-4 accent-slate-900"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </details>
              {sectorIncludesOther ? (
                <Input
                  type="text"
                  value={sectorOther}
                  onChange={(event) => setSectorOther(event.target.value)}
                  placeholder="Please specify"
                  className="border-slate-900/20 bg-white"
                />
              ) : null}
            </fieldset>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-950">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-700/55" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 chars, with upper/lower/number/symbol"
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
                  minLength={8}
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
              Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.
            </p>

            <label className="flex items-start gap-3 rounded-lg border border-slate-900/10 bg-white px-3 py-2 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={betaConsent}
                onChange={(event) => setBetaConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-slate-900"
              />
              <span>
                I consent to participate in beta testing and acknowledge that my usage and feedback data may be processed to evaluate and improve the app.
              </span>
            </label>

            <p className="text-xs text-slate-600">
              Read our beta privacy note{' '}
              <Link className="font-semibold text-slate-900 underline underline-offset-4" to={ROUTES.betaPrivacy}>
                here
              </Link>
              .
            </p>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 w-full rounded-xl bg-slate-900 text-slate-50 hover:bg-slate-800"
            >
              Join our beta run
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