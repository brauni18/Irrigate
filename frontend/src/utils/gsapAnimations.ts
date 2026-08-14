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