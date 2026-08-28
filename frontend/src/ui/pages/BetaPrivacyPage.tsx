import { Link } from 'react-router';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/router/routes.consts';
import { Button } from '@/shadcn/components/ui/button';
import { AuthPageLayout } from '@/ui/components';

export function BetaPrivacyPage() {
  return (
    <AuthPageLayout
      compact
      card={
        <section className="w-full rounded-3xl border border-slate-900/10 bg-white/80 p-6 shadow-2xl shadow-sky-900/10 backdrop-blur md:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-50 px-3 py-1 text-sm font-medium text-slate-900">
            <ShieldCheck className="size-4" />
            Beta privacy note
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">How we use beta data</h1>

          <p className="mt-4 text-sm leading-6 text-slate-700">
            By joining our beta, you consent to the collection and analysis of product usage data, feedback,
            and technical diagnostics. We use this information only to test features, improve reliability,
            and enhance user experience.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            We do not sell your personal data. Access is limited to authorized team members and service providers
            who support product operations under confidentiality obligations.
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            If you prefer not to participate under these terms, do not complete beta signup.
          </p>

          <Button asChild className="mt-6 h-11 rounded-xl bg-slate-900 px-6 text-slate-50 hover:bg-slate-800">
            <Link to={ROUTES.signup}>Back to signup</Link>
          </Button>
        </section>
      }
    />
  );
}
