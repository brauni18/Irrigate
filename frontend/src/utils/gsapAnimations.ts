import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

gsap.registerPlugin(useGSAP);

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animatePageEnter(target: HTMLElement) {
  if (prefersReducedMotion()) {
    gsap.set(target, { clearProps: 'all' });
    return;
  }

  gsap.killTweensOf(target);
  gsap.fromTo(
    target,
    { autoAlpha: 0, y: 14 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.42,
      ease: 'power2.out',
      overwrite: 'auto',
      clearProps: 'transform',
    },
  );
}

type AuthTransitionDirection = 1 | -1;

function resolveAxisOffset(direction: AuthTransitionDirection, magnitude: number) {
  return direction === 1 ? magnitude : -magnitude;
}

export function animateAuthPageEnter(container: HTMLElement, direction: AuthTransitionDirection = 1) {
  const pageRoot = container.firstElementChild as HTMLElement | null;
  const main = pageRoot?.querySelector('main') as HTMLElement | null;
  const sections = main ? Array.from(main.children).filter((child): child is HTMLElement => child instanceof HTMLElement) : [];

  if (prefersReducedMotion()) {
    gsap.set(container, { clearProps: 'all' });
    if (pageRoot) {
      gsap.set(pageRoot, { clearProps: 'all' });
    }
    if (main) {
      gsap.set(main, { clearProps: 'all' });
    }
    if (sections.length > 0) {
      gsap.set(sections, { clearProps: 'all' });
    }
    return;
  }

  gsap.killTweensOf(container);
  if (pageRoot) {
    gsap.killTweensOf(pageRoot);
  }
  if (main) {
    gsap.killTweensOf(main);
  }
  if (sections.length > 0) {
    gsap.killTweensOf(sections);
  }

  const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } });

  timeline.fromTo(
    container,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.2, ease: 'power1.out' },
  );

  if (main) {
    timeline.fromTo(
      main,
      { autoAlpha: 0, x: resolveAxisOffset(direction, 44), y: 12 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.52,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0,
    );
  }

  if (sections.length > 0) {
    timeline.fromTo(
      sections,
      { autoAlpha: 0, x: resolveAxisOffset(direction, 24), y: 18 },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration: 0.56,
        ease: 'power3.out',
        stagger: 0.08,
        clearProps: 'transform,opacity,visibility',
      },
      0.08,
    );
  }

  return timeline;
}

export function animateAuthPageExit(
  container: HTMLElement,
  direction: AuthTransitionDirection,
  onComplete?: () => void,
) {
  const pageRoot = container.firstElementChild as HTMLElement | null;
  const main = pageRoot?.querySelector('main') as HTMLElement | null;
  const sections = main ? Array.from(main.children).filter((child): child is HTMLElement => child instanceof HTMLElement) : [];

  if (prefersReducedMotion()) {
    gsap.set(container, { clearProps: 'all' });
    if (pageRoot) {
      gsap.set(pageRoot, { clearProps: 'all' });
    }
    if (main) {
      gsap.set(main, { clearProps: 'all' });
    }
    if (sections.length > 0) {
      gsap.set(sections, { clearProps: 'all' });
    }
    onComplete?.();
    return;
  }

  gsap.killTweensOf(container);
  if (pageRoot) {
    gsap.killTweensOf(pageRoot);
  }
  if (main) {
    gsap.killTweensOf(main);
  }
  if (sections.length > 0) {
    gsap.killTweensOf(sections);
  }

  const timeline = gsap.timeline({ defaults: { overwrite: 'auto' }, onComplete });

  if (sections.length > 0) {
    timeline.to(
      sections,
      {
        autoAlpha: 0,
        x: resolveAxisOffset(direction, -18),
        y: -4,
        duration: 0.22,
        ease: 'power2.in',
        stagger: { each: 0.03, from: 'end' },
      },
      0,
    );
  }

  if (main) {
    timeline.to(
      main,
      {
        autoAlpha: 0,
        x: resolveAxisOffset(direction, -36),
        y: -8,
        duration: 0.28,
        ease: 'power2.inOut',
      },
      0,
    );
  }

  timeline.to(
    container,
    {
      autoAlpha: 0,
      duration: 0.18,
      ease: 'power1.in',
      clearProps: 'transform,opacity,visibility',
    },
    0.08,
  );
}

export function animateDialogState(content: HTMLElement, overlay: HTMLElement | null, isOpen: boolean) {
  const revealTargets = Array.from(
    content.querySelectorAll<HTMLElement>('[data-slot="dialog-header"], [data-slot="dialog-footer"], form > *'),
  );

  if (prefersReducedMotion()) {
    gsap.set(content, { clearProps: 'all' });
    if (overlay) {
      gsap.set(overlay, { clearProps: 'all' });
    }
    if (revealTargets.length > 0) {
      gsap.set(revealTargets, { clearProps: 'all' });
    }
    return;
  }

  gsap.killTweensOf(content);
  if (revealTargets.length > 0) {
    gsap.killTweensOf(revealTargets);
  }
  if (overlay) {
    gsap.killTweensOf(overlay);
  }

  if (isOpen) {
    const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } });

    if (overlay) {
      timeline.fromTo(
        overlay,
        { autoAlpha: 0, backdropFilter: 'blur(0px)' },
        {
          autoAlpha: 1,
          backdropFilter: 'blur(2px)',
          duration: 0.7,
          ease: 'power2.out',
        },
        0,
      );
    }

    timeline.fromTo(
      content,
      { autoAlpha: 0, y: 18, scale: 0.985 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'power3.out',
      },
      0,
    );

    if (revealTargets.length > 0) {
      timeline.fromTo(
        revealTargets,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          stagger: 0.08,
          clearProps: 'transform',
        },
        0.12,
      );
    }

    return;
  }

  const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } });

  if (revealTargets.length > 0) {
    timeline.to(revealTargets, {
      autoAlpha: 0,
      y: 4,
      duration: 0.28,
      ease: 'power1.in',
      stagger: { each: 0.04, from: 'end' },
    });
  }

  if (overlay) {
    timeline.to(overlay, {
      autoAlpha: 0,
      backdropFilter: 'blur(0px)',
      duration: 0.4,
      ease: 'power1.in',
    }, 0);
  }

  timeline.to(content, {
    autoAlpha: 0,
    y: 10,
    scale: 0.985,
    duration: 0.4,
    ease: 'power2.in',
  }, 0);
}

export function animateSectionReveal(container: HTMLElement, selector = '[data-animate="section"]') {
  if (prefersReducedMotion()) {
    gsap.set(container.querySelectorAll(selector), { clearProps: 'all' });
    return;
  }

  const targets = Array.from(container.querySelectorAll<HTMLElement>(selector));
  if (targets.length === 0) return;

  gsap.killTweensOf(targets);
  gsap.fromTo(
    targets,
    { autoAlpha: 0, y: 16 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 0.38,
      ease: 'power2.out',
      stagger: 0.07,
      overwrite: 'auto',
      clearProps: 'transform',
    },
  );
}