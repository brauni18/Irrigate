import type { ReactNode } from 'react';

type AuthPageLayoutProps = {
  hero?: ReactNode;
  card: ReactNode;
  reverseDesktopOrder?: boolean;
  compact?: boolean;
};

export function AuthPageLayout({ hero, card, reverseDesktopOrder = false, compact = false }: AuthPageLayoutProps) {
  if (compact) {
    return (
      <div
        className="relative min-h-svh overflow-hidden bg-[radial-gradient(1100px_560px_at_100%_0%,#bae6fd,transparent),radial-gradient(760px_460px_at_0%_100%,#a7f3d0,transparent),linear-gradient(180deg,#ecfeff_0%,#eff6ff_100%)]"
        style={{ fontFamily: "'Space Grotesk', 'Avenir Next', 'Segoe UI', sans-serif" }}
      >
        <div className="pointer-events-none absolute top-16 right-20 h-52 w-52 rounded-full bg-sky-300/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 left-10 h-64 w-64 rounded-full bg-emerald-300/35 blur-3xl" />

        <main className="relative mx-auto flex min-h-svh w-full max-w-2xl items-center px-6 py-12">
          {card}
        </main>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-svh overflow-hidden bg-[radial-gradient(1100px_560px_at_100%_0%,#bae6fd,transparent),radial-gradient(760px_460px_at_0%_100%,#a7f3d0,transparent),linear-gradient(180deg,#ecfeff_0%,#eff6ff_100%)]"
      style={{ fontFamily: "'Space Grotesk', 'Avenir Next', 'Segoe UI', sans-serif" }}
    >
      <div className="pointer-events-none absolute top-16 right-20 h-52 w-52 rounded-full bg-sky-300/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-8 left-10 h-64 w-64 rounded-full bg-emerald-300/35 blur-3xl" />

      <main
        className={`relative mx-auto grid min-h-svh w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-12 lg:px-10 ${reverseDesktopOrder ? 'lg:grid-cols-[1fr_1.2fr]' : 'lg:grid-cols-[1.2fr_1fr]'}`}
      >
        {hero}
        {card}
      </main>
    </div>
  );
}