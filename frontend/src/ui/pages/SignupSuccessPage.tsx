import { Link } from 'react-router';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { ROUTES } from '@/router/routes.consts';
import { AuthPageLayout } from '@/ui/components';

export function SignupSuccessPage() {
  return (
    <AuthPageLayout
      compact
      card={
        <section className="w-full rounded-3xl border border-emerald-900/10 bg-white/80 p-6 text-center shadow-2xl shadow-emerald-900/10 backdrop-blur md:p-8">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900">
            <Sparkles className="size-4" />
            Beta signup received
          </div>

          <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-700" />

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">You are on the list</h1>
          <p className="mt-3 text-slate-700">
            Thank you for signing up for our beta product. We will reach out soon with the next steps.
          </p>

          <Link
            to={ROUTES.login}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-medium text-slate-50 shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
          >
            Back to login
          </Link>
        </section>
      }
    />
  );
}
